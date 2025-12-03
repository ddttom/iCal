const Database = require('./lib/database');
const { v4: uuidv4 } = require('uuid');

const db = new Database();

async function addAllDayEvent() {
    await db.init();
    const uid = uuidv4();
    const event = {
        uid: uid,
        summary: 'Test All Day Event',
        description: 'This is a test event for all-day verification.',
        location: 'Test Location',
        startDate: '2025-12-25', // YYYY-MM-DD format for all-day
        endDate: null,
        rrule: null,
        raw_data: ''
    };
    
    await db.createEvent(event);
    console.log(`Added all-day event with UID: ${uid}`);
    await db.close();
}

addAllDayEvent().catch(console.error);
