import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import pool from './db/db_connection.js'; // Assuming you have this set up to interact with your database

// Serialize user information into the session
passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

// Deserialize user information from the session
passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT user_id, name, email, role FROM users WHERE user_id = $1', [id]);
        const user = result.rows[0];
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Set up the local strategy for login
passport.use(new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' }, // Fields to match from the request body
    async (email, password, done) => {
        try {
            const result = await pool.query('SELECT user_id, name, email, password, role FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            // If user not found
            if (!user) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            // Compare passwords (hashed password stored in DB)
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            // Successfully authenticated
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

export default passport;
