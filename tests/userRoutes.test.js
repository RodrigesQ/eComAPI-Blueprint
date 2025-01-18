import request from 'supertest';
import app from '../server.js'; // Assuming this is your express app
import * as userModel from '../models/user.js'; // Importing the user model
import sinon from 'sinon';
import { expect } from 'chai';

describe('User Routes', () => {
    const mockUser = {
        id: 1,
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        password: 'hashedpassword',
        role: 'customer',
    };

    const mockUsers = [
        { id: 1, name: 'Jane Doe', email: 'janedoe@example.com', role: 'customer' },
        { id: 2, name: 'John Smith', email: 'johnsmith@example.com', role: 'admin' },
    ];

    let createUserStub, getAllUsersStub;

    beforeEach(() => {
        // Create Sinon stubs for the user model methods
        createUserStub = sinon.stub(userModel, 'createUser');
        getAllUsersStub = sinon.stub(userModel, 'getAllUsers');
    });

    afterEach(() => {
        // Restore stubs after each test
        sinon.restore();
    });

    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            createUserStub.resolves(mockUser); // Mock resolved value for createUser

            const res = await request(app)
                .post('/api/register')
                .send({
                    name: 'Jane Doe',
                    email: 'janedoe@example.com',
                    password: 'password123',
                    role: 'customer',
                });

            expect(res.status).to.equal(201); // Expected status code to be 201
            expect(res.body.message).to.equal('User registered successfully'); // Success message
            expect(res.body.user).to.deep.equal(mockUser); // Response body should match mock user
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({ email: 'janedoe@example.com' }); // Missing required fields

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('All fields are required');
        });

        it('should return 400 for invalid email format', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    name: 'Jane Doe',
                    email: 'invalidemail', // Invalid email format
                    password: 'password123',
                });

            expect(res.status).to.equal(400);
            expect(res.body.message).to.equal('Invalid email format');
        });

        it('should return 500 for database errors', async () => {
            createUserStub.rejects(new Error('Database error')); // Simulate error

            const res = await request(app)
                .post('/api/register')
                .send({
                    name: 'Jane Doe',
                    email: 'janedoe@example.com',
                    password: 'password123',
                });

            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Failed to register user');
        });
    });

    describe('GET /users', () => {
        it('should retrieve all users successfully', async () => {
            getAllUsersStub.resolves(mockUsers); // Mock resolved value for getAllUsers

            const res = await request(app).get('/api/users');

            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal(mockUsers); // Response should match the list of mock users
        });

        it('should return 500 if an error occurs while retrieving users', async () => {
            getAllUsersStub.rejects(new Error('Database error')); // Simulate error

            const res = await request(app).get('/api/users');

            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Failed to retrieve users');
        });
    });
});
