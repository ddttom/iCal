const CalendarManager = require('../lib/calendar');
const fs = require('fs');
const path = require('path');

async function run() {
    const dbPath = path.resolve(__dirname, '../calendar.db');
    const manager = new CalendarManager(dbPath);
    await manager.init();

    console.log('Fetching all events...');
    const { events } = await manager.listEvents(100000); // Fetch a large number to get all
    
    const map = new Map();
    const duplicates = [];

    console.log(`Total events found: ${events.length}`);

    events.forEach(e => {
        // Create a unique key based on summary, start, and end dates
        const key = `${e.summary}|${e.startDate.dateTime}|${e.endDate ? e.endDate.dateTime : 'null'}`;
        
        if (map.has(key)) {
            duplicates.push(e);
        } else {
            map.set(key, e);
        }
    });

    console.log(`Found ${duplicates.length} duplicates.`);

    if (duplicates.length === 0) {
        console.log('No duplicates to remove.');
        return;
    }

    console.log('Removing duplicates...');
    let removedCount = 0;
    
    for (const event of duplicates) {
        try {
            await manager.deleteEvent(event.uid);
            removedCount++;
            if (removedCount % 50 === 0) {
                process.stdout.write('.');
            }
        } catch (err) {
            console.error(`Failed to delete event ${event.uid}:`, err);
        }
    }

    console.log(`\nSuccessfully removed ${removedCount} duplicate events.`);
}

run().catch(console.error);
