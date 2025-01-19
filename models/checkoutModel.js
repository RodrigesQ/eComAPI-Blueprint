import pool from '../db/db_connection.js';

// Validate cart and fetch cart details
export const validateCart = async (cartId, userId) => {
    return pool.query(
        `SELECT c.total_amount, ci.product_id, ci.quantity, ci.item_price, p.stock_quantity
         FROM Carts c
         LEFT JOIN Cart_Items ci ON c.cart_id = ci.cart_id
         LEFT JOIN Products p ON ci.product_id = p.product_id
         WHERE c.cart_id = $1 AND c.user_id = $2`,
        [cartId, userId]
    );
};

// Create a new order
export const createOrder = async (userId, totalAmount) => {
    const result = await pool.query(
        'INSERT INTO Orders (user_id, total_amount, order_date) VALUES ($1, $2, NOW()) RETURNING order_id',
        [userId, totalAmount]
    );
    return result.rows[0].order_id;
};

// Deduct stock for a product
export const deductStock = async (productId, quantity) => {
    return pool.query(
        'UPDATE Products SET stock_quantity = stock_quantity - $1 WHERE product_id = $2',
        [quantity, productId]
    );
};

// Add items to the Order_Items table
export const addOrderItem = async (orderId, productId, quantity, itemPrice) => {
    return pool.query(
        'INSERT INTO Order_Items (order_id, product_id, quantity, item_price) VALUES ($1, $2, $3, $4)',
        [orderId, productId, quantity, itemPrice]
    );
};

// Clear the cart
export const clearCart = async (cartId) => {
    await pool.query('DELETE FROM Cart_Items WHERE cart_id = $1', [cartId]);
    await pool.query('UPDATE Carts SET total_amount = 0 WHERE cart_id = $1', [cartId]);
};
