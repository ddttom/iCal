const CalendarManager = require('../lib/calendar');
const fs = require('fs');
const path = require('path');
const ICAL = require('ical.js');

const DB_PATH = path.join(__dirname, 'repro_date.db');

async function run() {
    // Clean up previous run
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

    const calendarManager = new CalendarManager(DB_PATH);
    await calendarManager.init();

    console.log('1. Adding timed event...');
    const uidTimed = await calendarManager.addEvent({
        summary: 'Timed Event',
        startDate: '2025-01-01T10:00:00',
        endDate: '2025-01-01T11:00:00'
    });

    console.log('2. Adding all-day event...');
    // For all-day, we usually pass YYYY-MM-DD. 
    // However, addEvent ensuresSeconds, so it might turn it into YYYY-MM-DDT00:00:00
    // But let's see what happens if we pass a date without time, or how we want to support all-day.
    // The current addEvent logic forces seconds, so it effectively makes everything timed unless we handle it differently.
    // But let's check what _mapRowToEvent does with what we have.
    
    // Actually, to support all-day properly, we should probably allow YYYY-MM-DD without time in addEvent, 
    // but the current ensureSeconds forces it. 
    // For this repro, let's focus on the READ side (isAllDay detection) assuming we have some data.
    // But since we can only add via addEvent, let's see what we get.
    
    const uidAllDay = await calendarManager.addEvent({
        summary: 'All Day Event',
        startDate: '2025-01-02', // ensureSeconds will likely make this 2025-01-02T00:00:00 if it treats it as string
        endDate: '2025-01-03'
    });

    console.log('3. Verifying events...');
    const { events } = await calendarManager.listEvents();
    
    const timedEvent = events.find(e => e.uid === uidTimed);
    const allDayEvent = events.find(e => e.uid === uidAllDay);

    console.log('Timed Event:', timedEvent.startDate.dateTime, 'isAllDay:', timedEvent.isAllDay);
    console.log('All Day Event:', allDayEvent.startDate.dateTime, 'isAllDay:', allDayEvent.isAllDay);

    // Check Timed Event
    // Expected: 2025-01-01T10:00:00.000Z (ISO) and isAllDay: false
    // Current Buggy Behavior: 2025-01-01T10:00:00 (ical string) and isAllDay: false (length 19 != 10)
    
    // Check All Day Event
    // If ensureSeconds added time, it's not all day in DB. 
    // But if we manually inserted an all-day event (length 8), isAllDay should be true.
    // Since we can't easily bypass addEvent without raw DB access, let's just check if the output format is valid for new Date()
    
    const isValidDate = (d) => !isNaN(new Date(d).getTime());

    if (!isValidDate(timedEvent.startDate.dateTime)) {
        console.error('FAIL: Timed event startDate is NOT a valid JS Date string for frontend.');
    } else {
        console.log('PASS: Timed event startDate is valid JS Date string.');
    }

    // The user mentioned isAllDay logic is row.startDate.length === 10.
    // ICAL.Time.toString() for timed is ISO-like but no hyphens? Wait.
    // ICAL.Time.toString() -> "20250101T100000" (basic ISO) usually, unless .toString() on the property.
    // Let's see what we actually get.
    
    if (timedEvent.isAllDay) {
        console.error('FAIL: Timed event marked as isAllDay.');
    }

    // If we want to test TRUE all-day, we might need to insert directly to DB to simulate "legacy" or correct all-day data
    // because addEvent currently forces time.
    // But the primary issue reported is that the heuristic is wrong AND the format is wrong.
}

run().catch(console.error);
