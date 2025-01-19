import express from 'express';
import bcrypt from 'bcrypt';
import validator from 'validator';
import pool from '../db/db_connection.js'; // Import your db connection
import { authenticateJWT, checkAdmin } from '../middleware/authMiddleware.js'; // Middleware for JWT authentication and role checking

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password, role = 'customer' } = req.body;

    // Basic Validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Normalize and validate email format
    const sanitizedEmail = validator.normalizeEmail(email);
    if (!validator.isEmail(sanitizedEmail)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Validate name
    if (name.trim().length === 0) {
        return res.status(400).json({ message: 'Name cannot be empty' });
    }

    // Ensure valid role
    const sanitizedRole = role === 'admin' ? 'admin' : 'customer';

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role',
            [name.trim(), sanitizedEmail, hashedPassword, sanitizedRole]
        );

        const user = result.rows[0];

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error while registering user:', error);

        if (error.code === '23505') {
            return res.status(400).json({ message: 'Email already exists' });
        }

        res.status(500).json({ message: 'Failed to register user' });
    }
});

// Get all users (Admin-only)
router.get('/users', authenticateJWT, checkAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT user_id, name, email, role FROM users');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to retrieve users' });
    }
});

// Get user by ID (Authenticated users can only access their own data; Admins can access any user's data)
router.get('/users/:userId', authenticateJWT, async (req, res) => {
    const { userId } = req.params;

    try {
        // Check if the logged-in user matches the requested user or if they are an admin
        if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId)) {
            return res.status(403).json({ message: 'Access forbidden' });
        }

        const result = await pool.query('SELECT user_id, name, email, role FROM users WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to retrieve user' });
    }
});

// Update user by ID (Authenticated users can update their own data; Admins can update any user's data)
router.put('/users/:userId', authenticateJWT, async (req, res) => {
    const { userId } = req.params;
    const { name, email, password } = req.body;

    try {
        // Check if the logged-in user matches the requested user or if they are an admin
        if (req.user.role !== 'admin' && req.user.userId !== parseInt(userId)) {
            return res.status(403).json({ message: 'Access forbidden' });
        }

        // Validate email and password (if provided)
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (name) {
            updates.push(`name = $${paramIndex++}`);
            params.push(name.trim());
        }

        if (email) {
            const sanitizedEmail = validator.normalizeEmail(email);
            if (!validator.isEmail(sanitizedEmail)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
            updates.push(`email = $${paramIndex++}`);
            params.push(sanitizedEmail);
        }

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`password = $${paramIndex++}`);
            params.push(hashedPassword);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No updates provided' });
        }

        params.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING user_id, name, email, role`;

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// Delete user by ID (Admin-only)
router.delete('/users/:userId', authenticateJWT, checkAdmin, async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(204).send(); // No Content
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

export default router;
