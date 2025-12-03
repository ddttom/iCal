const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const ICAL = require('ical.js');

const dbPath = path.resolve('calendar.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Fixing events at 23:00...');
    
    db.all("SELECT * FROM events WHERE startDate LIKE '%T23:00:00%'", (err, rows) => {
        if (err) {
            console.error('Error fetching events:', err);
            return;
        }
        
        console.log(`Found ${rows.length} events to fix.`);
        
        const stmt = db.prepare("UPDATE events SET startDate = ?, endDate = ? WHERE uid = ?");
        
        let fixedCount = 0;
        
        rows.forEach(row => {
            try {
                // Parse start date
                const start = ICAL.Time.fromString(row.startDate);
                // Add 1 hour
                start.adjust(0, 1, 0, 0);
                const newStart = start.toString();
                
                let newEnd = null;
                if (row.endDate) {
                    const end = ICAL.Time.fromString(row.endDate);
                    end.adjust(0, 1, 0, 0);
                    newEnd = end.toString();
                }
                
                stmt.run(newStart, newEnd, row.uid, (err) => {
                    if (err) console.error(`Error updating ${row.uid}:`, err);
                    else {
                        // console.log(`Fixed: ${row.summary} (${row.startDate} -> ${newStart})`);
                    }
                });
                fixedCount++;
            } catch (e) {
                console.error(`Error processing ${row.uid}:`, e);
            }
        });
        
        stmt.finalize(() => {
            console.log(`Processed ${fixedCount} events.`);
            db.close();
        });
    });
});
