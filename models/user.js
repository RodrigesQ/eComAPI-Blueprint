import bcrypt from 'bcryptjs';
import pool from '../db/db_connection.js'; // Adjust the path if needed

// Create a new user
export const createUser = async (name, email, password, role = 'customer') => {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const query = 'INSERT INTO Users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [name, email, hashedPassword, role];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Find a user by email
export const findUserByEmail = async (email) => {
    try {
        const query = 'SELECT * FROM Users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0];
    } catch (error) {
        console.error('Error finding user by email:', error);
        throw error; // Let the calling function handle the error
    }
};

// Get all users
export const getAllUsers = async () => {
    const query = 'SELECT * FROM Users';

    try {
        const result = await pool.query(query);
        return result.rows; // Return all rows (users)
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};
