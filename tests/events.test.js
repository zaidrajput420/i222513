const request = require('supertest');  
const app = require('../server');  
const db = require('../db/dummyDb');  

let authToken;  
let userId;  

beforeEach(async () => {  
    db.users = []; // Reset users  
    db.events = []; // Reset events  

    // Register a test user and capture the token.  
    const res = await request(app)  
        .post('/api/auth/register')  
        .send({  
            username: 'testuser',  
            password: 'password123'  
        });  

    // Check if the response contains the token  
    if (!res.body.token) {  
        throw new Error('Token not returned from registration');  
    }  
    
    authToken = res.body.token; // Set the auth token  
    userId = db.users[0]?.id; // Safely access user ID  
    if (!userId) {  
        throw new Error('User ID not found after registration');  
    }  
});  

describe('Event Endpoints', () => {  
    describe('POST /api/events', () => {  
        it('should create a new event', async () => {  
            const eventData = {  
                name: 'Test Event',  
                description: 'Test Description',  
                date: '2024-12-25',  
                time: '14:30',  
                category: 'Meetings',  
                reminder: {  
                    time: 30,  
                    unit: 'minutes'  
                }  
            };  

            const res = await request(app)  
                .post('/api/events')  
                .set('Authorization', `Bearer ${authToken}`)  
                .send(eventData);  
            
            expect(res.statusCode).toBe(201);  
            expect(res.body).toMatchObject(eventData);  
            expect(db.events).toHaveLength(1); // Ensure one event was added  
        });  

        it('should not create event without authentication', async () => {  
            const res = await request(app)  
                .post('/api/events')  
                .send({  
                    name: 'Test Event',  
                    date: '2024-12-25',  
                    time: '14:30'  
                });  
            
            expect(res.statusCode).toBe(401);  
        });  
    });  

    // ... Remaining Tests  
});  
