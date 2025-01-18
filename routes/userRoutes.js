import express from 'express';
import bcrypt from 'bcrypt';
import validator from 'validator';
import pool from '../db/db_connection.js'; // Import your db connection

// Create a new express router
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

    // Validate name (cannot be empty)
    if (name.trim().length === 0) {
        return res.status(400).json({ message: 'Name cannot be empty' });
    }

    // Ensure valid role (default to 'customer')
    const sanitizedRole = role === 'admin' ? 'admin' : 'customer';

    try {
        // Password Salting (Hashing) - Passwords are never stored in plain text
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds for bcrypt

        // Create the user in the database (insert query)
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role',
            [name.trim(), sanitizedEmail, hashedPassword, sanitizedRole]
        );

        const user = result.rows[0];

        // Return response with user data (excluding password)
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.user_id, // Use `user_id` here
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error while registering user:', error);

        // Check for unique constraint violation (email already exists)
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Generic error response for other failures
        res.status(500).json({ message: 'Failed to register user' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        // Fetch all users from the database
        const result = await pool.query('SELECT user_id, name, email, role FROM users');

        // Return the users as a response
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to retrieve users' });
    }
});

// Export the router (default export)
export default router;
