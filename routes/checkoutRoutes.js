import express from 'express';
import {
    validateCart,
    createOrder,
    deductStock,
    addOrderItem,
    clearCart,
} from '../models/checkoutModel.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /cart/{cartId}/checkout - Handle checkout process
router.post('/cart/:cartId/checkout', authenticateJWT, async (req, res) => {
    const { cartId } = req.params;
    const { user_id } = req.user; // Extract user ID from JWT

    try {
        // Step 1: Validate the cart
        const cartResult = await validateCart(cartId, user_id);

        if (cartResult.rows.length === 0) {
            return res.status(404).json({ message: 'Cart not found or is empty' });
        }

        const cartItems = cartResult.rows;
        const totalAmount = cartItems[0].total_amount;

        if (!totalAmount || cartItems.every(item => item.product_id === null)) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Step 2: Simulate payment processing
        const paymentSuccessful = true; // Assume payment always succeeds
        if (!paymentSuccessful) {
            return res.status(400).json({ message: 'Payment failed. Please try again' });
        }

        // Step 3: Create an order
        const orderId = await createOrder(user_id, totalAmount);

        // Step 4: Add items to the Order_Items table and update stock
        for (const item of cartItems) {
            const { product_id, quantity, item_price, stock_quantity } = item;

            if (!product_id) continue; // Skip empty cart items

            if (quantity > stock_quantity) {
                return res.status(400).json({ message: `Insufficient stock for product ID ${product_id}` });
            }

            // Deduct stock and add order item
            await deductStock(product_id, quantity);
            await addOrderItem(orderId, product_id, quantity, item_price);
        }

        // Step 5: Clear the cart
        await clearCart(cartId);

        res.status(201).json({
            message: 'Checkout successful',
            order: {
                orderId,
                totalAmount,
                items: cartItems.map(item => ({
                    productId: item.product_id,
                    quantity: item.quantity,
                    price: item.item_price,
                })),
            },
        });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Failed to process checkout' });
    }
});

export default router;
