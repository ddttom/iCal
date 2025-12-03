const CalendarManager = require('../lib/calendar');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'repro.db');
const ICS_PATH = path.join(__dirname, 'repro.ics');

async function run() {
    // Clean up previous run
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);
    if (fs.existsSync(ICS_PATH)) fs.unlinkSync(ICS_PATH);

    const calendarManager = new CalendarManager(DB_PATH);
    await calendarManager.init();

    console.log('1. Adding event...');
    const uid = await calendarManager.addEvent({
        summary: 'Original Event',
        startDate: '2025-01-01T10:00:00',
        endDate: '2025-01-01T11:00:00'
    });

    console.log('2. Updating event with datetime-local format (no seconds)...');
    // Simulate what comes from an HTML datetime-local input
    await calendarManager.updateEvent(uid, {
        summary: 'Updated Event',
        startDate: '2025-12-25T10:00', // Missing seconds
        endDate: '2025-12-25T12:00'   // Missing seconds
    });

    console.log('3. Verifying DB content...');
    const events = await calendarManager.listEvents();
    const event = events.events.find(e => e.uid === uid);

    console.log('   Stored Start Date:', event.startDate.dateTime);
    
    // Check if it was normalized (should have :00 seconds)
    if (event.startDate.dateTime.length === 16) {
        console.error('FAIL: Start date was NOT normalized (missing seconds).');
    } else {
        console.log('PASS: Start date normalized.');
    }

    // Check raw_data consistency
    // In the buggy version, raw_data is NOT updated or is just JSON, 
    // but if we want to test that it matches the NEW date, we need to parse it.
    // However, the current implementation might just leave the OLD raw_data or set it to JSON.
    // Let's check if export works.
    
    console.log('4. Exporting to ICS...');
    try {
        const icsData = await calendarManager.exportToICS();
        fs.writeFileSync(ICS_PATH, icsData);
        
        if (icsData.includes('DTSTART:20251225T100000')) {
             console.log('PASS: Exported ICS contains updated date.');
        } else {
             console.error('FAIL: Exported ICS does NOT contain updated date (likely using stale raw_data).');
             console.log('ICS Content snippet:', icsData.split('\n').filter(l => l.includes('DTSTART')));
        }

    } catch (e) {
        console.error('FAIL: Export crashed:', e.message);
    }
}

run().catch(console.error);
