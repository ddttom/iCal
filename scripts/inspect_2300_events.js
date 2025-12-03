const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('calendar.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Searching for events starting at 23:00...');
    
    // Look for ISO strings ending in T23:00:00.000Z or T23:00:00Z
    // SQLite LIKE is case insensitive usually, but let's be specific
    db.all("SELECT uid, summary, startDate, rrule FROM events WHERE startDate LIKE '%T23:00:00%'", (err, rows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        
        console.log(`Found ${rows.length} events at 23:00.`);
        rows.slice(0, 10).forEach(row => {
            console.log(`[${row.uid}] ${row.startDate} - ${row.summary} (RRULE: ${row.rrule})`);
        });
        
        db.close();
    });
});
