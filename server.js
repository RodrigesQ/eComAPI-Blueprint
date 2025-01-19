import dotenv from 'dotenv'; // Load environment variables
import express from 'express'; // Import the express library
import session from 'express-session'; // To manage sessions
import bodyParser from 'body-parser'; // To parse incoming request bodies
import passport from './passport-config.js'; // Passport configuration file
import cookieParser from 'cookie-parser'; // To parse cookies

// Import route files
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config(); // Load environment variables from .env

const app = express(); // Create an Express application
const PORT = process.env.PORT || 3000; // Use port from .env or fallback to 3000

// Middleware to parse incoming requests
app.use(bodyParser.json()); // Parse JSON payloads
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded payloads

// Middleware to parse cookies
app.use(cookieParser());

// Set up session handling
app.use(
    session({
        secret: process.env.SESSION_SECRET, // Secret key for session encryption
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // Set `secure: true` if using HTTPS (production)
    })
);

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Define a basic route to confirm the server is running
app.get('/', (req, res) => {
    res.send('Hello, World!!!'); // Return a simple greeting
});

// Register API routes
app.use('/api', userRoutes); // User-related routes
app.use('/api', authRoutes); // Authentication-related routes
app.use('/api', productRoutes); // Product-related routes
app.use('/api', cartRoutes); // Cart-related routes
app.use('/api', checkoutRoutes); // Checkout-related routes
app.use('/api', orderRoutes); // Order-related routes

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app; // Export the app for testing or further use
