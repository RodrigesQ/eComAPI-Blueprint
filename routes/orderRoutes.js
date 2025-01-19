import express from 'express';
import { getUserOrders, getOrderById } from '../models/orderModel.js';
import { authenticateJWT } from '../middleware/authMiddleware.js'; // Ensure the user is authenticated

const router = express.Router();

// GET /orders - Retrieve all orders for the authenticated user
router.get('/orders', authenticateJWT, async (req, res) => {
    const { user_id } = req.user; // Extract user ID from JWT

    try {
        const result = await getUserOrders(user_id);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        res.status(200).json({
            orders: result.rows,
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// GET /orders/{orderId} - Retrieve a specific order for the authenticated user
router.get('/orders/:orderId', authenticateJWT, async (req, res) => {
    const { orderId } = req.params;
    const { user_id } = req.user; // Extract user ID from JWT

    try {
        const result = await getOrderById(orderId, user_id);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found or does not belong to user' });
        }

        const order = result.rows[0];
        const orderDetails = result.rows.map(item => ({
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            itemPrice: item.item_price,
        }));

        res.status(200).json({
            orderId: order.order_id,
            orderDate: order.order_date,
            totalAmount: order.total_amount,
            items: orderDetails,
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Failed to fetch order details' });
    }
});

export default router;
