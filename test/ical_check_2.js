const ICAL = require('ical.js');

try {
    const time = ICAL.Time.fromString('2025-02-01T99:99:99');
    console.log('Parsed successfully:', time.toString());
} catch (e) {
    console.log('Error:', e.message);
}
