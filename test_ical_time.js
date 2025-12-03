const ICAL = require('ical.js');

const inputs = [
    "2025-12-03T09:00",
    "2025-12-03T09:00:00",
    "2025-12-03T09:00:00Z"
];

inputs.forEach(input => {
    try {
        console.log(`Testing '${input}'...`);
        const time = ICAL.Time.fromString(input);
        console.log("Success:", time.toString());
    } catch (e) {
        console.error("Error:", e.message);
    }
});
