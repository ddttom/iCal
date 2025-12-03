const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('calendar.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT rrule FROM events WHERE rrule IS NOT NULL AND rrule != ''", [], (err, rows) => {
    if (err) {
        console.error("Error querying database:", err);
        process.exit(1);
    }

    console.log(`Found ${rows.length} events with recurrence rules.`);

    const patterns = {};
    const frequencies = {};

    rows.forEach(row => {
        const rrule = row.rrule;
        
        // Count exact RRULE strings
        patterns[rrule] = (patterns[rrule] || 0) + 1;

        // Parse FREQ
        const freqMatch = rrule.match(/FREQ=([^;]+)/);
        if (freqMatch) {
            const freq = freqMatch[1];
            frequencies[freq] = (frequencies[freq] || 0) + 1;
        }
    });

    console.log("\n--- Recurrence Frequencies ---");
    Object.entries(frequencies)
        .sort((a, b) => b[1] - a[1])
        .forEach(([freq, count]) => {
            console.log(`${freq}: ${count}`);
        });

    console.log("\n--- Top 10 Recurrence Rules ---");
    Object.entries(patterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([rule, count]) => {
            console.log(`${count}x ${rule}`);
        });

    db.close();
});
