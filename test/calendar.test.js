const fs = require('fs');
const path = require('path');
const CalendarManager = require('../lib/calendar');

describe('CalendarManager', () => {
    const testDir = path.join(__dirname, 'temp');
    const testDbPath = path.join(testDir, 'test-calendar.db');

    beforeAll(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    afterAll(() => {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    afterEach(async () => {
        // Clean up DB file after each test if needed, or just let it persist and use fresh instance
        // For isolation, it's better to delete the DB file
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    describe('Initialization', () => {
        it('should initialize database', async () => {
            const calendar = new CalendarManager(testDbPath);
            await calendar.init();
            expect(fs.existsSync(testDbPath)).toBe(true);
            await calendar.db.close();
        });
    });

    describe('Event Operations', () => {
        let calendar;

        beforeEach(async () => {
            calendar = new CalendarManager(testDbPath);
            await calendar.init();
        });

        afterEach(async () => {
            await calendar.db.close();
        });

        it('should add event', async () => {
            const uid = await calendar.addEvent({
                summary: 'New Event',
                startDate: '2025-02-01T10:00:00Z'
            });
            expect(uid).toBeDefined();
            expect(typeof uid).toBe('string');

            const { events } = await calendar.listEvents();
            expect(events.length).toBe(1);
            expect(events[0].uid).toBe(uid);
            expect(events[0].summary).toBe('New Event');
        });

        it('should add event with all fields', async () => {
            const eventData = {
                summary: 'Complete Event',
                description: 'Event description',
                location: 'Test Location',
                startDate: '2025-02-01T10:00:00Z',
                endDate: '2025-02-01T11:00:00Z'
            };
            await calendar.addEvent(eventData);
            const { events } = await calendar.listEvents();
            expect(events[0].summary).toBe('Complete Event');
            expect(events[0].description).toBe('Event description');
            expect(events[0].location).toBe('Test Location');
        });

        it('should search events', async () => {
            await calendar.addEvent({
                summary: 'Meeting A',
                startDate: '2025-02-01T10:00:00Z'
            });
            await calendar.addEvent({
                summary: 'Meeting B',
                startDate: '2025-02-02T10:00:00Z'
            });

            const { events } = await calendar.searchEvents('Meeting A');
            expect(events.length).toBe(1);
            expect(events[0].summary).toBe('Meeting A');
        });

        it('should update event', async () => {
            const uid = await calendar.addEvent({
                summary: 'Original',
                startDate: '2025-02-01T10:00:00Z'
            });

            await calendar.updateEvent(uid, { summary: 'Updated' });
            const { events } = await calendar.listEvents();
            expect(events[0].summary).toBe('Updated');
        });

        it('should delete event', async () => {
            const uid = await calendar.addEvent({
                summary: 'To Delete',
                startDate: '2025-02-01T10:00:00Z'
            });

            await calendar.deleteEvent(uid);
            const { events } = await calendar.listEvents();
            expect(events.length).toBe(0);
        });
        
        it('should handle Date objects in addEvent', async () => {
             const uid = await calendar.addEvent({
                summary: 'Date Object Test',
                startDate: new Date('2025-02-01T10:00:00Z')
            });
            expect(uid).toBeDefined();
            const { events } = await calendar.listEvents();
            expect(events[0].summary).toBe('Date Object Test');
        });
    });
});
