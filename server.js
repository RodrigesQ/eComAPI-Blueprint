// server.js
import dotenv from 'dotenv'; // Load environment variables
import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser'; // To parse incoming request bodies
import passport from './passport-config.js'; // The file where you set up passport
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes.js'; // Use .js extension for local imports
import authRoutes from './routes/authRoutes.js'; // Import the authentication routes
import productRoutes from './routes/productRoutes.js'; // Assuming this is where you define your routes

dotenv.config(); // Initialize environment variables

const app = express();
const PORT = 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse cookies
app.use(cookieParser());

// Set up session handling
app.use(session({
    secret: process.env.SESSION_SECRET, // Secret key for session encryption from .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using https (recommended in production)
}));

// Initialize passport and use sessions
app.use(passport.initialize());
app.use(passport.session());

// Define a basic route
app.get('/', (req, res) => {
    res.send('Hello, World!!!');
});

// Register routes
app.use('/api', userRoutes); // Prefix all routes with `/api`

// Use the authentication routes
app.use('/api', authRoutes); // All routes in authRoutes will be prefixed with /api
// Use the product routes
app.use('/api', productRoutes); // Make sure the route prefix is correct


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app; // Export the app for testing
