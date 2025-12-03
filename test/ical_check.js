const ICAL = require('ical.js');

try {
    const time = ICAL.Time.fromString('2025-02-01T25:00:00');
    console.log('Parsed successfully:', time.toString());
    console.log('JS Date:', time.toJSDate());
} catch (e) {
    console.log('Error:', e.message);
}

try {
    const time2 = ICAL.Time.fromString('not-a-datetime');
    console.log('Parsed successfully:', time2.toString());
} catch (e) {
    console.log('Error:', e.message);
}
