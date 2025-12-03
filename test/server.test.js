const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Mock the calendar file path before requiring the server
const testDbPath = path.join(__dirname, 'temp', 'test-server.db');
process.env.TEST_MODE = 'true';

describe('Server API Endpoints', () => {
    let app;
    const testDir = path.join(__dirname, 'temp');
    let calendarManager;

    beforeAll(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    beforeEach(async () => {
        // Clean up and create fresh DB
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }

        // Create a mock Express app for testing
        const express = require('express');
        const bodyParser = require('body-parser');
        const CalendarManager = require('../lib/calendar');

        app = express();
        app.use(bodyParser.json());

        calendarManager = new CalendarManager(testDbPath);
        await calendarManager.init();

        // Initialize with a test event
        await calendarManager.addEvent({
            summary: 'Test Event',
            description: 'Test description',
            location: 'Test location',
            startDate: '2025-01-01T10:00:00Z',
            endDate: '2025-01-01T11:00:00Z'
        });

        // Define API routes
        app.get('/api/events', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const offset = (page - 1) * limit;
            const events = await calendarManager.listEvents(limit, offset);
            res.json(events);
        });

        app.get('/api/events/search', async (req, res) => {
            const query = req.query.q || '';
            const startDate = req.query.start;
            const endDate = req.query.end;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const offset = (page - 1) * limit;

            if (!query && !startDate && !endDate) {
                return res.status(400).json({ error: 'At least one filter parameter (q, start, end) is required' });
            }

            const events = await calendarManager.searchEvents(query, startDate, endDate, limit, offset);
            res.json(events);
        });

        app.post('/api/events', async (req, res) => {
            const eventData = req.body;
            if (!eventData.summary) {
                return res.status(400).json({ error: 'Summary is required' });
            }

            try {
                const uid = await calendarManager.addEvent(eventData);
                res.status(201).json({ uid, message: 'Event added successfully' });
            } catch (err) {
                res.status(500).json({ error: 'Failed to save event' });
            }
        });

        app.put('/api/events/:uid', async (req, res) => {
            const uid = req.params.uid;
            const updates = req.body;
            
            if (await calendarManager.updateEvent(uid, updates)) {
                res.json({ message: 'Event updated successfully' });
            } else {
                res.status(404).json({ error: 'Event not found' });
            }
        });

        app.delete('/api/events/:uid', async (req, res) => {
            const uid = req.params.uid;
            if (await calendarManager.deleteEvent(uid)) {
                res.json({ message: 'Event deleted successfully' });
            } else {
                res.status(404).json({ error: 'Event not found' });
            }
        });
    });

    afterAll(() => {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    describe('GET /api/events', () => {
        it('should return all events', async () => {
            const response = await request(app)
                .get('/api/events')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should return events with correct structure', async () => {
            const response = await request(app)
                .get('/api/events')
                .expect(200);

            const event = response.body[0];
            expect(event).toHaveProperty('uid');
            expect(event).toHaveProperty('summary');
            expect(event).toHaveProperty('startDate');
            expect(event).toHaveProperty('description');
            expect(event).toHaveProperty('location');
        });

        it('should return events with correct data', async () => {
            const response = await request(app)
                .get('/api/events')
                .expect(200);

            const event = response.body[0];
            expect(event.summary).toBe('Test Event');
            expect(event.description).toBe('Test description');
            expect(event.location).toBe('Test location');
        });
    });

    describe('GET /api/events/search', () => {
        it('should search events by query', async () => {
            const response = await request(app)
                .get('/api/events/search?q=Test')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should return 400 when query parameter is missing', async () => {
            const response = await request(app)
                .get('/api/events/search')
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('required');
        });

        it('should find events by summary', async () => {
            const response = await request(app)
                .get('/api/events/search?q=Test Event')
                .expect(200);

            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].summary).toContain('Test Event');
        });

        it('should find events by description', async () => {
            const response = await request(app)
                .get('/api/events/search?q=description')
                .expect(200);

            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should find events by location', async () => {
            const response = await request(app)
                .get('/api/events/search?q=location')
                .expect(200);

            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should return empty array for no matches', async () => {
            const response = await request(app)
                .get('/api/events/search?q=NonExistent')
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('should be case-insensitive', async () => {
            const response = await request(app)
                .get('/api/events/search?q=TEST')
                .expect(200);

            expect(response.body.length).toBeGreaterThan(0);
        });

        it('should filter by date range', async () => {
            // Create event in specific range
            await request(app)
                .post('/api/events')
                .send({
                    summary: 'Range Test',
                    startDate: '2025-04-01T10:00:00Z',
                    endDate: '2025-04-01T11:00:00Z'
                });

            const response = await request(app)
                .get('/api/events/search?start=2025-04-01&end=2025-04-02')
                .expect(200);

            const found = response.body.find(e => e.summary === 'Range Test');
            expect(found).toBeDefined();
        });
    });

    describe('POST /api/events', () => {
        it('should create a new event', async () => {
            const newEvent = {
                summary: 'New Event',
                description: 'New description',
                location: 'New location',
                startDate: '2025-02-01T10:00:00Z',
                endDate: '2025-02-01T11:00:00Z'
            };

            const response = await request(app)
                .post('/api/events')
                .send(newEvent)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toHaveProperty('uid');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('successfully');
        });

        it('should return 400 when summary is missing', async () => {
            const invalidEvent = {
                description: 'Description without summary',
                startDate: '2025-02-01T10:00:00Z'
            };

            const response = await request(app)
                .post('/api/events')
                .send(invalidEvent)
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('Summary is required');
        });

        it('should create event with minimal data', async () => {
            const minimalEvent = {
                summary: 'Minimal Event',
                startDate: '2025-02-01T10:00:00Z'
            };

            const response = await request(app)
                .post('/api/events')
                .send(minimalEvent)
                .expect(201);

            expect(response.body).toHaveProperty('uid');
        });

        it('should handle date strings correctly', async () => {
            const newEvent = {
                summary: 'Date Test Event',
                startDate: '2025-03-15T14:30:00Z',
                endDate: '2025-03-15T15:30:00Z'
            };

            const response = await request(app)
                .post('/api/events')
                .send(newEvent)
                .expect(201);

            expect(response.body.uid).toBeDefined();

            // Verify the event was saved
            const getResponse = await request(app)
                .get('/api/events')
                .expect(200);

            const savedEvent = getResponse.body.find(e => e.uid === response.body.uid);
            expect(savedEvent).toBeDefined();
            expect(savedEvent.summary).toBe('Date Test Event');
        });

        it('should increment event count after creation', async () => {
            const initialResponse = await request(app)
                .get('/api/events')
                .expect(200);
            const initialCount = initialResponse.body.length;

            await request(app)
                .post('/api/events')
                .send({
                    summary: 'Another Event',
                    startDate: '2025-02-15T10:00:00Z'
                })
                .expect(201);

            const finalResponse = await request(app)
                .get('/api/events')
                .expect(200);

            expect(finalResponse.body.length).toBe(initialCount + 1);
        });
    });

    describe('PUT /api/events/:uid', () => {
        let eventUid;

        beforeEach(async () => {
            const response = await request(app)
                .post('/api/events')
                .send({
                    summary: 'Original Event',
                    startDate: '2025-02-01T10:00:00Z'
                })
                .expect(201);
            eventUid = response.body.uid;
        });

        it('should update an existing event', async () => {
            const updates = {
                summary: 'Updated Event',
                description: 'Updated description'
            };

            await request(app)
                .put(`/api/events/${eventUid}`)
                .send(updates)
                .expect('Content-Type', /json/)
                .expect(200);

            // Verify update
            const response = await request(app)
                .get('/api/events')
                .expect(200);

            const updatedEvent = response.body.find(e => e.uid === eventUid);
            expect(updatedEvent.summary).toBe('Updated Event');
            expect(updatedEvent.description).toBe('Updated description');
        });

        it('should return 404 for non-existent UID', async () => {
            await request(app)
                .put('/api/events/non-existent-uid')
                .send({ summary: 'Updated' })
                .expect(404);
        });
    });

    describe('DELETE /api/events/:uid', () => {
        let eventUid;

        beforeEach(async () => {
            // Create an event to delete
            const response = await request(app)
                .post('/api/events')
                .send({
                    summary: 'Event to Delete',
                    startDate: '2025-02-01T10:00:00Z'
                })
                .expect(201);

            eventUid = response.body.uid;
        });

        it('should delete an event by UID', async () => {
            const response = await request(app)
                .delete(`/api/events/${eventUid}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('successfully');
        });

        it('should return 404 for non-existent UID', async () => {
            const response = await request(app)
                .delete('/api/events/non-existent-uid')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('not found');
        });

        it('should remove event from calendar', async () => {
            await request(app)
                .delete(`/api/events/${eventUid}`)
                .expect(200);

            // Verify event is gone
            const getResponse = await request(app)
                .get('/api/events')
                .expect(200);

            const deletedEvent = getResponse.body.find(e => e.uid === eventUid);
            expect(deletedEvent).toBeUndefined();
        });

        it('should decrement event count after deletion', async () => {
            const initialResponse = await request(app)
                .get('/api/events')
                .expect(200);
            const initialCount = initialResponse.body.length;

            await request(app)
                .delete(`/api/events/${eventUid}`)
                .expect(200);

            const finalResponse = await request(app)
                .get('/api/events')
                .expect(200);

            expect(finalResponse.body.length).toBe(initialCount - 1);
        });
    });

    describe('Integration: API workflow', () => {
        it('should handle complete CRUD workflow via API', async () => {
            // Create
            const createResponse = await request(app)
                .post('/api/events')
                .send({
                    summary: 'API Workflow Test',
                    description: 'Testing full API workflow',
                    location: 'API Test Location',
                    startDate: '2025-03-01T10:00:00Z',
                    endDate: '2025-03-01T11:00:00Z'
                })
                .expect(201);

            const uid = createResponse.body.uid;
            expect(uid).toBeDefined();

            // Read - Get all events
            const listResponse = await request(app)
                .get('/api/events')
                .expect(200);

            const createdEvent = listResponse.body.find(e => e.uid === uid);
            expect(createdEvent).toBeDefined();
            expect(createdEvent.summary).toBe('API Workflow Test');

            // Read - Search for event
            const searchResponse = await request(app)
                .get('/api/events/search?q=Workflow')
                .expect(200);

            expect(searchResponse.body.length).toBeGreaterThan(0);
            expect(searchResponse.body.some(e => e.uid === uid)).toBe(true);

            // Delete
            await request(app)
                .delete(`/api/events/${uid}`)
                .expect(200);

            // Verify deletion
            const finalListResponse = await request(app)
                .get('/api/events')
                .expect(200);

            const deletedEvent = finalListResponse.body.find(e => e.uid === uid);
            expect(deletedEvent).toBeUndefined();
        });
    });
});
