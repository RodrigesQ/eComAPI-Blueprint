import express from 'express';
import pool from '../db/db_connection.js'; // DB connection
import { authenticateJWT } from '../middleware/authMiddleware.js'; // Authentication middleware

const router = express.Router();

// POST /cart - Create a cart for the user
router.post('/cart', authenticateJWT, async (req, res) => {
    const { user_id } = req.user; // Extract user ID from JWT
    try {
        // Check if the user already has a cart
        const { rows } = await pool.query('SELECT cart_id FROM Carts WHERE user_id = $1', [user_id]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Cart already exists for this user' });
        }

        // Create a new cart
        const result = await pool.query(
            'INSERT INTO Carts (user_id, total_amount) VALUES ($1, $2) RETURNING cart_id',
            [user_id, 0.00]
        );

        // Respond with cart details
        res.status(201).json({
            message: 'Cart created successfully',
            cart: {
                cartId: result.rows[0].cart_id,
                userId: user_id,
                totalPrice: 0
            }
        });
    } catch (error) {
        console.error('Error creating cart:', error);
        res.status(500).json({ message: 'Failed to create cart' });
    }
});

// POST /cart/{cartId} - Add an item to a cart with reservation
// POST /cart/{cartId} - Add an item to a cart with reservation
router.post('/cart/:cartId', authenticateJWT, async (req, res) => {
    const { cartId } = req.params;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const reservationTimeout = 15 * 60 * 1000; // 15 minutes timeout (in milliseconds)

    try {
        // Fetch product price and check availability
        const productResult = await pool.query('SELECT price, stock_quantity FROM Products WHERE product_id = $1', [product_id]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const { price, stock_quantity } = productResult.rows[0];

        if (quantity > stock_quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Deduct stock immediately
        await pool.query(
            'UPDATE Products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2',
            [quantity, product_id]
        );

        // Add a reservation entry for this product
        const now = new Date();
        const reservationExpiry = new Date(now.getTime() + reservationTimeout);

        await pool.query(
            'INSERT INTO Product_Reservations (product_id, user_id, reserved_until, reserved_quantity) VALUES ($1, $2, $3, $4)',
            [product_id, req.user.user_id, reservationExpiry, quantity]
        );

        // Add item to the cart
        const itemPrice = price * quantity;
        await pool.query(
            `INSERT INTO Cart_Items (cart_id, product_id, quantity, item_price) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (cart_id, product_id) DO UPDATE
             SET quantity = Cart_Items.quantity + $3, 
                 item_price = Cart_Items.item_price + $4`,
            [cartId, product_id, quantity, itemPrice]
        );

        // Update total amount in the cart
        await pool.query(
            'UPDATE Carts SET total_amount = total_amount + $1 WHERE cart_id = $2',
            [itemPrice, cartId]
        );

        res.status(201).json({ message: 'Item added to cart and reserved' });

        // Schedule a task to restore stock if the reservation expires
        setTimeout(async () => {
            const { rowCount } = await pool.query(
                `DELETE FROM Product_Reservations 
                 WHERE product_id = $1 AND user_id = $2 AND reserved_until < NOW()`,
                [product_id, req.user.user_id]
            );

            // Restore stock only if the reservation is expired and not purchased
            if (rowCount > 0) {
                await pool.query(
                    'UPDATE Products SET stock_quantity = stock_quantity + $1 WHERE product_id = $2',
                    [quantity, product_id]
                );
            }
        }, reservationTimeout);

    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ message: 'Failed to add item to cart' });
    }
});


// GET /cart/{cartId} - Fetch items in a cart
router.get('/cart/:cartId', authenticateJWT, async (req, res) => {
    const { cartId } = req.params;
    try {
        // Fetch cart items
        const items = await pool.query(
            `SELECT ci.cart_item_id, ci.product_id, p.name, ci.quantity, ci.item_price
             FROM Cart_Items ci
             INNER JOIN Products p ON ci.product_id = p.product_id
             WHERE ci.cart_id = $1`,
            [cartId]
        );

        // Fetch cart total amount
        const cart = await pool.query('SELECT total_amount FROM Carts WHERE cart_id = $1', [cartId]);

        if (cart.rows.length === 0) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json({
            cart_id: cartId,
            total_amount: cart.rows[0].total_amount,
            items: items.rows,
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Failed to fetch cart' });
    }
});

// PUT /cart/:cartId - Update item quantity in cart
router.put('/cart/:cartId', authenticateJWT, async (req, res) => {
    const { cartId } = req.params;
    const { product_id, quantity } = req.body;

    if (!product_id || quantity === undefined) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    try {
        // Fetch the current cart item details
        const cartItemResult = await pool.query(
            'SELECT quantity, item_price FROM Cart_Items WHERE cart_id = $1 AND product_id = $2',
            [cartId, product_id]
        );

        if (cartItemResult.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        const currentQuantity = cartItemResult.rows[0].quantity;

        // Calculate the difference between the old and new quantities
        const quantityDifference = quantity - currentQuantity;

        if (quantityDifference > 0) {
            // If the new quantity is greater, ensure there is enough stock
            const productResult = await pool.query(
                'SELECT stock_quantity, price FROM Products WHERE product_id = $1',
                [product_id]
            );

            if (productResult.rows.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const { stock_quantity, price } = productResult.rows[0];

            if (quantityDifference > stock_quantity) {
                return res.status(400).json({ message: 'Insufficient stock for the requested update' });
            }

            // Deduct the additional quantity from stock
            await pool.query(
                'UPDATE Products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2',
                [quantityDifference, product_id]
            );
        } else if (quantityDifference < 0) {
            // If the new quantity is less, return the difference to stock
            const quantityToReturn = -quantityDifference; // Convert to positive
            await pool.query(
                'UPDATE Products SET stock_quantity = stock_quantity + $1 WHERE product_id = $2',
                [quantityToReturn, product_id]
            );
        }

        // Update the cart item quantity and item price
        const productResult = await pool.query(
            'SELECT price FROM Products WHERE product_id = $1',
            [product_id]
        );
        const price = productResult.rows[0].price;
        const newItemPrice = price * quantity;

        await pool.query(
            `UPDATE Cart_Items 
             SET quantity = $1, item_price = $2 
             WHERE cart_id = $3 AND product_id = $4`,
            [quantity, newItemPrice, cartId, product_id]
        );

        // Update the cart's total amount
        const totalAmountAdjustment = newItemPrice - cartItemResult.rows[0].item_price;
        await pool.query(
            'UPDATE Carts SET total_amount = total_amount + $1 WHERE cart_id = $2',
            [totalAmountAdjustment, cartId]
        );

        res.status(200).json({ message: 'Cart item updated successfully' });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Failed to update cart item' });
    }
});

// DELETE /cart/{cartId}/product/{productId} - Remove item from cart and restore stock
router.delete('/cart/:cartId/product/:productId', authenticateJWT, async (req, res) => {
    const { cartId, productId } = req.params;

    try {
        // Find the product in the cart
        const result = await pool.query(
            'DELETE FROM Cart_Items WHERE cart_id = $1 AND product_id = $2 RETURNING item_price, quantity',
            [cartId, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        const { item_price, quantity } = result.rows[0];

        // Restore stock for the product
        await pool.query(
            'UPDATE Products SET stock_quantity = stock_quantity + $1 WHERE product_id = $2',
            [quantity, productId]
        );

        // Update the total amount in the cart
        await pool.query(
            'UPDATE Carts SET total_amount = total_amount - $1 WHERE cart_id = $2',
            [item_price, cartId]
        );

        res.status(200).json({ message: 'Item removed from cart and stock restored' });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ message: 'Failed to remove item from cart' });
    }
});

// DELETE /cart/{cartId} - Clear the cart and restore stock
router.delete('/cart/:cartId', authenticateJWT, async (req, res) => {
    const { cartId } = req.params;

    try {
        // Fetch all items in the cart
        const cartItems = await pool.query(
            'SELECT product_id, quantity FROM Cart_Items WHERE cart_id = $1',
            [cartId]
        );

        // Restore stock for each product in the cart
        for (const item of cartItems.rows) {
            const { product_id, quantity } = item;
            await pool.query(
                'UPDATE Products SET stock_quantity = stock_quantity + $1 WHERE product_id = $2',
                [quantity, product_id]
            );
        }

        // Clear the cart
        await pool.query('DELETE FROM Cart_Items WHERE cart_id = $1', [cartId]);
        await pool.query('UPDATE Carts SET total_amount = 0 WHERE cart_id = $1', [cartId]);

        res.status(200).json({ message: 'Cart cleared and stock restored' });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ message: 'Failed to clear cart' });
    }
});

export default router;
