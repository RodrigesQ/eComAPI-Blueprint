import dotenv from 'dotenv'; // Import dotenv for loading environment variables
import pkg from 'pg'; // Import the default export from 'pg'
const { Pool } = pkg; // Destructure the Pool class from the package

dotenv.config(); // Load environment variables from .env file

// Access the environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Optional: You can log the PostgreSQL version to verify the connection
pool.query('SELECT version();', (err, res) => {
    if (err) {
        console.error('Error executing query:', err);
    } else {
        console.log('PostgreSQL version:', res.rows[0].version);
    }

    // Close the pool after the query is complete
    //pool.end(() => {
    //    console.log('Database connection closed');
    //});
});

// Export the pool so it can be used in other files
export default pool;
