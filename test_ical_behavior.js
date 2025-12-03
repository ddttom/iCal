const ICAL = require('ical.js');

const icsData = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:allday-event
DTSTART;VALUE=DATE:20231225
SUMMARY:Christmas
END:VEVENT
END:VCALENDAR`;

const jcalData = ICAL.parse(icsData);
const comp = new ICAL.Component(jcalData);
const vevent = comp.getFirstSubcomponent('vevent');
const event = new ICAL.Event(vevent);

console.log('startDate:', event.startDate);
console.log('startDate.toString():', event.startDate.toString());
console.log('startDate.isDate:', event.startDate.isDate);
console.log('startDate.toJSDate():', event.startDate.toJSDate());
