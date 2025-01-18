// server.js
import dotenv from 'dotenv'; // Load environment variables
import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes.js'; // Use .js extension for local imports

dotenv.config(); // Initialize environment variables

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json()); // Parse incoming JSON requests

// Define a basic route
app.get('/', (req, res) => {
    res.send('Hello, World!!!');
});

// Register routes
app.use('/api', userRoutes); // Prefix all routes with `/api`

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app; // Export the app for testing
