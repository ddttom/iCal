const ICAL = require('ical.js');

const dateStr = '1978-05-11';
const time = ICAL.Time.fromString(dateStr);

console.log('Original String:', dateStr);
console.log('ICAL.Time:', time.toString());
console.log('isDate:', time.isDate);
console.log('timezone:', time.timezone);

const jsDate = time.toJSDate();
console.log('JS Date (UTC):', jsDate.toISOString());
console.log('JS Date (Local):', jsDate.toString());

// Test with explicit UTC
const utcTime = ICAL.Time.fromString(dateStr);
utcTime.zone = ICAL.TimeZone.utcTimezone;
console.log('UTC Time JS Date:', utcTime.toJSDate().toISOString());
