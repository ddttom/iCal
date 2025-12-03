const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const CalendarManager = require('../lib/calendar');
const Database = require('../lib/database');
const path = require('path');
const fs = require('fs');

// Mock dependencies
jest.mock('../lib/database');

describe('Pagination API', () => {
    let app;
    let calendarManager;
    let mockDb;

    beforeEach(() => {
        // Setup mock DB
        mockDb = {
            init: jest.fn().mockResolvedValue(),
            getAllEvents: jest.fn(),
            getEventCount: jest.fn(),
            searchEvents: jest.fn(),
            getSearchCount: jest.fn()
        };
        Database.mockImplementation(() => mockDb);

        // Setup app
        app = express();
        app.use(bodyParser.json());
        calendarManager = new CalendarManager();
        // Inject mock DB into calendar manager (since we mocked the constructor)
        calendarManager.db = mockDb;

        // Setup routes (copy from server.js simplified)
        app.get('/api/events', async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const offset = (page - 1) * limit;

                const { events, total } = await calendarManager.listEvents(limit, offset);
                res.json({ 
                    events, 
                    total, 
                    page, 
                    limit,
                    totalDatabaseCount: total // Mock implementation assumes total is totalDatabaseCount
                });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.get('/api/events/search', async (req, res) => {
            try {
                const query = req.query.q || '';
                const startDate = req.query.start;
                const endDate = req.query.end;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const offset = (page - 1) * limit;

                const { events, total } = await calendarManager.searchEvents(query, startDate, endDate, limit, offset);
                res.json({ 
                    events, 
                    total, 
                    page, 
                    limit,
                    totalDatabaseCount: total // Mock implementation assumes total is totalDatabaseCount
                });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
    });

    test('GET /api/events returns paginated results with total count', async () => {
        const mockEvents = [
            { uid: '1', summary: 'Event 1', startDate: '2023-01-01' },
            { uid: '2', summary: 'Event 2', startDate: '2023-01-02' }
        ];
        mockDb.getAllEvents.mockResolvedValue(mockEvents);
        mockDb.getEventCount.mockResolvedValue(10);

        const res = await request(app).get('/api/events?page=1&limit=2');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            events: expect.any(Array),
            total: 10,
            page: 1,
            limit: 2,
            totalDatabaseCount: 10
        });
        expect(res.body.events).toHaveLength(2);
        expect(mockDb.getAllEvents).toHaveBeenCalledWith(2, 0);
        expect(mockDb.getEventCount).toHaveBeenCalled();
    });

    test('GET /api/events uses default page=1 and limit=50 when omitted', async () => {
        const mockEvents = [{ uid: '1', summary: 'Event 1', startDate: '2023-01-01' }];
        mockDb.getAllEvents.mockResolvedValue(mockEvents);
        mockDb.getEventCount.mockResolvedValue(100);

        const res = await request(app).get('/api/events');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            events: expect.any(Array),
            total: 100,
            page: 1,
            limit: 50,
            totalDatabaseCount: 100
        });
        expect(mockDb.getAllEvents).toHaveBeenCalledWith(50, 0);
    });

    test('GET /api/events calculates offset correctly for non-trivial page and limit', async () => {
        const mockEvents = [{ uid: '21', summary: 'Event 21', startDate: '2023-01-03' }];
        mockDb.getAllEvents.mockResolvedValue(mockEvents);
        mockDb.getEventCount.mockResolvedValue(200);

        const res = await request(app).get('/api/events?page=3&limit=10');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            events: expect.any(Array),
            total: 200,
            page: 3,
            limit: 10,
            totalDatabaseCount: 200
        });
        // Offset should be (3-1) * 10 = 20
        expect(mockDb.getAllEvents).toHaveBeenCalledWith(10, 20);
    });

    test('GET /api/events returns 500 when DB throws', async () => {
        mockDb.getAllEvents.mockRejectedValue(new Error('Database error'));

        const res = await request(app).get('/api/events');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            error: 'Database error'
        });
    });

    test('GET /api/events/search returns paginated search results with total count', async () => {
        const mockEvents = [{ uid: '1', summary: 'Meeting', startDate: '2023-01-01' }];
        mockDb.searchEvents.mockResolvedValue(mockEvents);
        mockDb.getSearchCount.mockResolvedValue(5);

        const res = await request(app).get('/api/events/search?q=Meeting&page=2&limit=1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            events: expect.any(Array),
            total: 5,
            page: 2,
            limit: 1,
            totalDatabaseCount: 5
        });
        expect(mockDb.searchEvents).toHaveBeenCalledWith('Meeting', undefined, undefined, 1, 1);
        expect(mockDb.getSearchCount).toHaveBeenCalledWith('Meeting', undefined, undefined);
    });

    test('GET /api/events/search handles pagination defaults', async () => {
        const mockEvents = [{ uid: '1', summary: 'Meeting', startDate: '2023-01-01' }];
        mockDb.searchEvents.mockResolvedValue(mockEvents);
        mockDb.getSearchCount.mockResolvedValue(5);

        const res = await request(app).get('/api/events/search?q=Meeting');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            events: expect.any(Array),
            total: 5,
            page: 1,
            limit: 50,
            totalDatabaseCount: 5
        });
        expect(mockDb.searchEvents).toHaveBeenCalledWith('Meeting', undefined, undefined, 50, 0);
    });
});
