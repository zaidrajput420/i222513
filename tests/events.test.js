const request = require('supertest');
const app = require('../server');
const db = require('../db/dummyDb');

let authToken;
let userId;

beforeEach(async () => {
    db.users = [];
    db.events = [];
    
    const res = await request(app)
        .post('/api/auth/register')
        .send({
            username: 'testuser',
            password: 'password123'
        });
    
    authToken = res.body.token;
    userId = db.users[0].id;
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
            expect(db.events).toHaveLength(1);
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

    describe('GET /api/events', () => {
        beforeEach(async () => {
            await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Event 1',
                    description: 'Test Description',
                    date: '2024-12-25',
                    time: '14:30',
                    category: 'Meetings'
                });

            await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Event 2',
                    description: 'Test Description',
                    date: '2024-12-26',
                    time: '15:30',
                    category: 'Personal'
                });
        });

        it('should get all events for user', async () => {
            const res = await request(app)
                .get('/api/events')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(2);
        });

        it('should filter events by category', async () => {
            const res = await request(app)
                .get('/api/events?category=Meetings')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].category).toBe('Meetings');
        });

        it('should sort events by date', async () => {
            const res = await request(app)
                .get('/api/events?sort=date')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body[0].date).toBe('2024-12-25');
            expect(res.body[1].date).toBe('2024-12-26');
        });
    });

    describe('PUT /api/events/:id', () => {
        let eventId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Event',
                    description: 'Test Description',
                    date: '2024-12-25',
                    time: '14:30',
                    category: 'Meetings'
                });
            
            eventId = res.body.id;
        });

        it('should update an event', async () => {
            const res = await request(app)
                .put(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Updated Event',
                    description: 'Updated Description'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Updated Event');
            expect(res.body.description).toBe('Updated Description');
        });
    });

    describe('DELETE /api/events/:id', () => {
        let eventId;

        beforeEach(async () => {
            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Event',
                    description: 'Test Description',
                    date: '2024-12-25',
                    time: '14:30',
                    category: 'Meetings'
                });
            
            eventId = res.body.id;
        });

        it('should delete an event', async () => {
            const res = await request(app)
                .delete(`/api/events/${eventId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.statusCode).toBe(204);
            expect(db.events).toHaveLength(0);
        });
    });
}); 