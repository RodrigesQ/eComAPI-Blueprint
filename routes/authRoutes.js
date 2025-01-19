import express from 'express';
import passport from '../passport-config.js'; // Import Passport configuration
import jwt from 'jsonwebtoken'; // Import the JWT package
import dotenv from 'dotenv';
import { authenticateJWT } from '../middleware/authMiddleware.js'; // Import the authentication middleware

dotenv.config(); // Load environment variables

const router = express.Router();

// Login endpoint using Passport.js Local strategy and JWT
router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    const user = req.user;

    // Create a JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });

    // Send the token as a response
    res.json({ message: 'Login successful', token });
});

// Protected route: Dashboard (requires authentication)
router.get('/dashboard', authenticateJWT, (req, res) => {
    res.json({ message: 'Welcome to your dashboard!', user: req.user });
});

// Logout route (if using sessions)
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

export default router;
































