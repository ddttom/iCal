const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('calendar.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Inspecting Wedding Anniversary event...');
    
    db.all("SELECT * FROM events WHERE summary LIKE 'Wedding Anniversary%'", (err, rows) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        
        console.log(`Found ${rows.length} events.`);
        rows.forEach(row => {
            console.log('---');
            console.log(`UID: ${row.uid}`);
            console.log(`Summary: ${row.summary}`);
            console.log(`StartDate: '${row.startDate}'`); // Quote to see whitespace/format
            console.log(`EndDate: '${row.endDate}'`);
            console.log(`RRULE: ${row.rrule}`);
        });
        
        db.close();
    });
});
