import pool from '../db/db_connection.js';

// Get all orders for a user
export const getUserOrders = async (userId) => {
    return pool.query(
        `SELECT o.order_id, o.order_date, o.total_amount 
         FROM Orders o 
         WHERE o.user_id = $1 
         ORDER BY o.order_date DESC`,
        [userId]
    );
};

// Get a specific order by ID for a user
export const getOrderById = async (orderId, userId) => {
    return pool.query(
        `SELECT o.order_id, o.order_date, o.total_amount, oi.product_id, oi.quantity, oi.item_price, p.name AS product_name
         FROM Orders o
         JOIN Order_Items oi ON o.order_id = oi.order_id
         JOIN Products p ON oi.product_id = p.product_id
         WHERE o.user_id = $1 AND o.order_id = $2`,
        [userId, orderId]
    );
};
