const request = require('supertest');
const app = require('../server');
const db = require('../db/dummyDb');

beforeEach(() => {
    db.users = [];
});

describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(db.users).toHaveLength(1);
        });

        it('should not register duplicate username', async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Username already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });
        });

        it('should login existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should not login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'wrongpassword'
                });
            
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid credentials');
        });
    });
}); 