import express from 'express';
import pool from '../db/db_connection.js'; // PostgreSQL connection pool
import { authenticateJWT, checkAdmin } from '../middleware/authMiddleware.js'; // Middlewares for JWT and admin check

const router = express.Router();

// GET /products?category={categoryId}
router.get('/products', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM Products';
        const params = [];

        if (category) {
            query += ' WHERE category_id = $1';
            params.push(category);
        }

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /products/:productId
router.get('/products/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { rows } = await pool.query('SELECT * FROM Products WHERE product_id = $1', [productId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST /products (requires JWT and admin access)
router.post('/products', authenticateJWT, checkAdmin, async (req, res) => {
    try {
        const { name, description, price, stock_quantity, category_id } = req.body;
        const { rows } = await pool.query(
            'INSERT INTO Products (name, description, price, stock_quantity, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, stock_quantity, category_id]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT /products/:productId (requires JWT and admin access)
router.put('/products/:productId', authenticateJWT, checkAdmin, async (req, res) => {
    try {
        const { productId } = req.params;
        const { name, description, price, stock_quantity, category_id } = req.body;

        const { rows } = await pool.query(
            `UPDATE Products 
             SET name = $1, description = $2, price = $3, stock_quantity = $4, category_id = $5 
             WHERE product_id = $6 RETURNING *`,
            [name, description, price, stock_quantity, category_id, productId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /products/:productId (requires JWT and admin access)
router.delete('/products/:productId', authenticateJWT, checkAdmin, async (req, res) => {
    try {
        const { productId } = req.params;

        const { rowCount } = await pool.query('DELETE FROM Products WHERE product_id = $1', [productId]);

        if (rowCount === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(204).send(); // No content
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

export default router;
