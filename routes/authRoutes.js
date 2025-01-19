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
    const token = jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role }, // Change `user.id` to `user.user_id`
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Send the token as a response
    res.json({ message: 'Login successful', token });
});

// Protected route: Dashboard (requires authentication)
router.get('/dashboard', authenticateJWT, (req, res) => {
    // req.user is populated by the authenticateJWT middleware
    res.json({ message: 'Welcome to your dashboard!', user: req.user });
});

// Logout route (if using sessions)
router.post('/logout', (req, res) => {
    // Destroy session (if using session-based authentication)
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });

    // Alternatively, if using JWT, there is no need to destroy the session. Just inform the user to forget the token.
    // In case of JWT, you can also handle client-side logout by removing the token on the front end.
});

export default router;
