const fs = require('fs');
const path = require('path');
const CalendarManager = require('../lib/calendar');

describe('CalendarManager Date Search', () => {
    const testDir = path.join(__dirname, 'temp_search');
    const testDbPath = path.join(testDir, 'test-search.db');

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
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    let calendar;

    beforeEach(async () => {
        calendar = new CalendarManager(testDbPath);
        await calendar.init();
        
        // Add test events
        await calendar.addEvent({
            summary: 'New Year Party',
            startDate: '2025-01-01T10:00:00'
        });
        
        await calendar.addEvent({
            summary: 'Valentine Day',
            startDate: '2025-02-14T10:00:00'
        });
        
        await calendar.addEvent({
            summary: 'Meeting',
            startDate: '2025-01-02T10:00:00'
        });
    });

    afterEach(async () => {
        await calendar.db.close();
    });

    it('should search by DD/MM/YYYY', async () => {
        const { events } = await calendar.searchEvents('01/01/2025');
        expect(events.length).toBe(1);
        expect(events[0].summary).toBe('New Year Party');
    });

    it('should search by MM/DD/YYYY', async () => {
        // 02/14/2025
        const { events } = await calendar.searchEvents('02/14/2025');
        expect(events.length).toBe(1);
        expect(events[0].summary).toBe('Valentine Day');
    });

    it('should search by YYYY-MM-DD', async () => {
        const { events } = await calendar.searchEvents('2025-01-01');
        expect(events.length).toBe(1);
        expect(events[0].summary).toBe('New Year Party');
    });

    it('should handle ambiguous dates (01/02/2025)', async () => {
        // 01/02/2025 could be Jan 2nd or Feb 1st.
        // My implementation searches for BOTH if they are different.
        // Jan 2nd exists (Meeting). Feb 1st does not.
        
        // Let's add Feb 1st event to test ambiguity
        await calendar.addEvent({
            summary: 'Feb First',
            startDate: '2025-02-01T10:00:00'
        });
        
        const { events } = await calendar.searchEvents('01/02/2025');
        // Should find BOTH "Meeting" (Jan 2nd) and "Feb First" (Feb 1st)
        expect(events.length).toBe(2);
        const summaries = events.map(e => e.summary);
        expect(summaries).toContain('Meeting');
        expect(summaries).toContain('Feb First');
    });

    it('should still support text search', async () => {
        const { events } = await calendar.searchEvents('Party');
        expect(events.length).toBe(1);
        expect(events[0].summary).toBe('New Year Party');
    });
});
