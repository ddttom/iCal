const fs = require('fs');
const path = require('path');
const CalendarManager = require('../lib/calendar');

describe('CalendarManager', () => {
    const testDir = path.join(__dirname, 'temp');
    const testFile = path.join(testDir, 'test-calendar.ics');
    const fixtureFile = path.join(__dirname, 'fixtures', 'sample.ics');

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

    afterEach(() => {
        if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile);
        }
    });

    describe('Constructor', () => {
        it('should create instance with file path', () => {
            const calendar = new CalendarManager(testFile);
            expect(calendar.filePath).toBe(testFile);
            expect(calendar.jcalData).toBe(null);
            expect(calendar.comp).toBe(null);
        });
    });

    describe('load', () => {
        it('should load valid iCal file', () => {
            fs.copyFileSync(fixtureFile, testFile);
            const calendar = new CalendarManager(testFile);
            expect(calendar.load()).toBe(true);
            expect(calendar.comp).not.toBe(null);
        });

        it('should return false for non-existent file', () => {
            const calendar = new CalendarManager(testFile);
            expect(calendar.load()).toBe(false);
        });

        it('should return false for invalid iCal content', () => {
            fs.writeFileSync(testFile, 'Invalid content');
            const calendar = new CalendarManager(testFile);
            expect(calendar.load()).toBe(false);
        });

        it('should parse calendar data correctly', () => {
            fs.copyFileSync(fixtureFile, testFile);
            const calendar = new CalendarManager(testFile);
            calendar.load();
            expect(calendar.jcalData).not.toBe(null);
            expect(calendar.comp).not.toBe(null);
        });
    });

    describe('save', () => {
        it('should save calendar to file', () => {
            const calendar = new CalendarManager(testFile);
            calendar.addEvent({
                summary: 'Test Event',
                startDate: new Date('2025-01-01T10:00:00Z')
            });
            expect(calendar.save()).toBe(true);
            expect(fs.existsSync(testFile)).toBe(true);
        });

        it('should return false when comp is null', () => {
            const calendar = new CalendarManager(testFile);
            expect(calendar.save()).toBe(false);
        });

        it('should create valid iCal format', () => {
            const calendar = new CalendarManager(testFile);
            calendar.addEvent({
                summary: 'Test Event',
                startDate: new Date('2025-01-01T10:00:00Z')
            });
            calendar.save();
            const content = fs.readFileSync(testFile, 'utf-8');
            expect(content).toContain('BEGIN:VCALENDAR');
            expect(content).toContain('BEGIN:VEVENT');
            expect(content).toContain('END:VEVENT');
            expect(content).toContain('END:VCALENDAR');
        });
    });

    describe('listEvents', () => {
        it('should return empty array when no calendar loaded', () => {
            const calendar = new CalendarManager(testFile);
            expect(calendar.listEvents()).toEqual([]);
        });

        it('should list all events from calendar', () => {
            fs.copyFileSync(fixtureFile, testFile);
            const calendar = new CalendarManager(testFile);
            calendar.load();
            const events = calendar.listEvents();
            expect(events.length).toBe(3);
        });

        it('should return events with correct structure', () => {
            fs.copyFileSync(fixtureFile, testFile);
            const calendar = new CalendarManager(testFile);
            calendar.load();
            const events = calendar.listEvents();
            const event = events[0];
            expect(event).toHaveProperty('uid');
            expect(event).toHaveProperty('summary');
            expect(event).toHaveProperty('startDate');
            expect(event).toHaveProperty('endDate');
            expect(event).toHaveProperty('description');
            expect(event).toHaveProperty('location');
        });

        it('should return events with correct data types', () => {
            fs.copyFileSync(fixtureFile, testFile);
            const calendar = new CalendarManager(testFile);
            calendar.load();
            const events = calendar.listEvents();
            const event = events[0];
            expect(typeof event.uid).toBe('string');
            expect(typeof event.summary).toBe('string');
            expect(event.startDate).toBeInstanceOf(Date);
        });
    });

    describe('searchEvents', () => {
        let calendar;

        beforeEach(() => {
            fs.copyFileSync(fixtureFile, testFile);
            calendar = new CalendarManager(testFile);
            calendar.load();
        });

        it('should find events by summary', () => {
            const results = calendar.searchEvents('Meeting');
            expect(results.length).toBe(1);
            expect(results[0].summary).toContain('Meeting');
        });

        it('should find events by description', () => {
            const results = calendar.searchEvents('milestones');
            expect(results.length).toBe(1);
            expect(results[0].description).toContain('milestones');
        });

        it('should find events by location', () => {
            const results = calendar.searchEvents('Office');
            expect(results.length).toBe(1);
            expect(results[0].location).toBe('Office');
        });

        it('should be case-insensitive', () => {
            const results1 = calendar.searchEvents('MEETING');
            const results2 = calendar.searchEvents('meeting');
            expect(results1.length).toBe(results2.length);
        });

        it('should return empty array for no matches', () => {
            const results = calendar.searchEvents('NonExistent');
            expect(results).toEqual([]);
        });

        it('should return multiple matches', () => {
            const results = calendar.searchEvents('Day');
            expect(results.length).toBeGreaterThan(0);
        });
    });

    describe('addEvent', () => {
        it('should add event to empty calendar', () => {
            const calendar = new CalendarManager(testFile);
            const uid = calendar.addEvent({
                summary: 'New Event',
                startDate: new Date('2025-02-01T10:00:00Z')
            });
            expect(uid).toBeDefined();
            expect(typeof uid).toBe('string');
        });

        it('should add event to existing calendar', () => {
            fs.copyFileSync(fixtureFile, testFile);
            const calendar = new CalendarManager(testFile);
            calendar.load();
            const initialCount = calendar.listEvents().length;
            calendar.addEvent({
                summary: 'New Event',
                startDate: new Date('2025-02-01T10:00:00Z')
            });
            expect(calendar.listEvents().length).toBe(initialCount + 1);
        });

        it('should add event with all fields', () => {
            const calendar = new CalendarManager(testFile);
            calendar.addEvent({
                summary: 'Complete Event',
                description: 'Event description',
                location: 'Test Location',
                startDate: new Date('2025-02-01T10:00:00Z'),
                endDate: new Date('2025-02-01T11:00:00Z')
            });
            const events = calendar.listEvents();
            expect(events[0].summary).toBe('Complete Event');
            expect(events[0].description).toBe('Event description');
            expect(events[0].location).toBe('Test Location');
        });

        it('should handle optional fields', () => {
            const calendar = new CalendarManager(testFile);
            calendar.addEvent({
                summary: 'Minimal Event',
                startDate: new Date('2025-02-01T10:00:00Z')
            });
            const events = calendar.listEvents();
            expect(events[0].description).toBe('');
            expect(events[0].location).toBe('');
        });

        it('should generate unique UIDs', () => {
            const calendar = new CalendarManager(testFile);
            const uid1 = calendar.addEvent({
                summary: 'Event 1',
                startDate: new Date('2025-02-01T10:00:00Z')
            });
            const uid2 = calendar.addEvent({
                summary: 'Event 2',
                startDate: new Date('2025-02-01T11:00:00Z')
            });
            expect(uid1).not.toBe(uid2);
        });
    });

    describe('updateEvent', () => {
        let calendar;
        let eventUid;

        beforeEach(() => {
            calendar = new CalendarManager(testFile);
            eventUid = calendar.addEvent({
                summary: 'Original Event',
                description: 'Original description',
                location: 'Original location',
                startDate: new Date('2025-02-01T10:00:00Z'),
                endDate: new Date('2025-02-01T11:00:00Z')
            });
        });

        it('should update event summary', () => {
            const result = calendar.updateEvent(eventUid, {
                summary: 'Updated Event'
            });
            expect(result).toBe(true);
            const events = calendar.listEvents();
            expect(events[0].summary).toBe('Updated Event');
        });

        it('should update event description', () => {
            calendar.updateEvent(eventUid, {
                description: 'Updated description'
            });
            const events = calendar.listEvents();
            expect(events[0].description).toBe('Updated description');
        });

        it('should update event location', () => {
            calendar.updateEvent(eventUid, {
                location: 'Updated location'
            });
            const events = calendar.listEvents();
            expect(events[0].location).toBe('Updated location');
        });

        it('should update event dates', () => {
            const newStart = new Date('2025-03-01T10:00:00Z');
            const newEnd = new Date('2025-03-01T11:00:00Z');
            calendar.updateEvent(eventUid, {
                startDate: newStart,
                endDate: newEnd
            });
            const events = calendar.listEvents();
            expect(events[0].startDate.toISOString()).toBe(newStart.toISOString());
            expect(events[0].endDate.toISOString()).toBe(newEnd.toISOString());
        });

        it('should update multiple fields at once', () => {
            calendar.updateEvent(eventUid, {
                summary: 'Multi Update',
                description: 'Multi description',
                location: 'Multi location'
            });
            const events = calendar.listEvents();
            expect(events[0].summary).toBe('Multi Update');
            expect(events[0].description).toBe('Multi description');
            expect(events[0].location).toBe('Multi location');
        });

        it('should return false for non-existent UID', () => {
            const result = calendar.updateEvent('non-existent-uid', {
                summary: 'Updated'
            });
            expect(result).toBe(false);
        });

        it('should return false when calendar not loaded', () => {
            const emptyCalendar = new CalendarManager(testFile);
            const result = emptyCalendar.updateEvent(eventUid, {
                summary: 'Updated'
            });
            expect(result).toBe(false);
        });
    });

    describe('deleteEvent', () => {
        let calendar;
        let eventUid;

        beforeEach(() => {
            calendar = new CalendarManager(testFile);
            eventUid = calendar.addEvent({
                summary: 'Event to Delete',
                startDate: new Date('2025-02-01T10:00:00Z')
            });
        });

        it('should delete event by UID', () => {
            const initialCount = calendar.listEvents().length;
            const result = calendar.deleteEvent(eventUid);
            expect(result).toBe(true);
            expect(calendar.listEvents().length).toBe(initialCount - 1);
        });

        it('should return false for non-existent UID', () => {
            const result = calendar.deleteEvent('non-existent-uid');
            expect(result).toBe(false);
        });

        it('should return false when calendar not loaded', () => {
            const emptyCalendar = new CalendarManager(testFile);
            const result = emptyCalendar.deleteEvent(eventUid);
            expect(result).toBe(false);
        });

        it('should remove event completely', () => {
            calendar.deleteEvent(eventUid);
            const events = calendar.listEvents();
            const deletedEvent = events.find(e => e.uid === eventUid);
            expect(deletedEvent).toBeUndefined();
        });

        it('should handle deleting from calendar with multiple events', () => {
            const uid2 = calendar.addEvent({
                summary: 'Event 2',
                startDate: new Date('2025-02-02T10:00:00Z')
            });
            const uid3 = calendar.addEvent({
                summary: 'Event 3',
                startDate: new Date('2025-02-03T10:00:00Z')
            });
            calendar.deleteEvent(uid2);
            const events = calendar.listEvents();
            expect(events.length).toBe(2);
            expect(events.find(e => e.uid === eventUid)).toBeDefined();
            expect(events.find(e => e.uid === uid3)).toBeDefined();
        });
    });

    describe('Integration: Full workflow', () => {
        it('should handle complete CRUD workflow', () => {
            // Create
            const calendar = new CalendarManager(testFile);
            const uid = calendar.addEvent({
                summary: 'Workflow Test',
                description: 'Test description',
                location: 'Test location',
                startDate: new Date('2025-02-01T10:00:00Z'),
                endDate: new Date('2025-02-01T11:00:00Z')
            });

            // Save
            expect(calendar.save()).toBe(true);

            // Read (reload from file)
            const calendar2 = new CalendarManager(testFile);
            expect(calendar2.load()).toBe(true);
            const events = calendar2.listEvents();
            expect(events.length).toBe(1);
            expect(events[0].summary).toBe('Workflow Test');

            // Update
            calendar2.updateEvent(uid, { summary: 'Updated Workflow Test' });
            calendar2.save();

            // Verify update
            const calendar3 = new CalendarManager(testFile);
            calendar3.load();
            const updatedEvents = calendar3.listEvents();
            expect(updatedEvents[0].summary).toBe('Updated Workflow Test');

            // Delete
            calendar3.deleteEvent(uid);
            calendar3.save();

            // Verify deletion
            const calendar4 = new CalendarManager(testFile);
            calendar4.load();
            expect(calendar4.listEvents().length).toBe(0);
        });
    });
});
