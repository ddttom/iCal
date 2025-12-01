const ICAL = require('ical.js');
const fs = require('fs');

const data = fs.readFileSync('calendar.ics', 'utf8');
const jcalData = ICAL.parse(data);
const comp = new ICAL.Component(jcalData);
const vevents = comp.getAllSubcomponents('vevent');

vevents.forEach(vevent => {
    const event = new ICAL.Event(vevent);
    const start = event.startDate;
    
    console.log('Summary:', event.summary);
    console.log('  ICAL String:', start.toString());
    console.log('  isDate:', start.isDate);
    console.log('  isUtc:', start.isUtc);
    console.log('  zone:', start.zone.toString());
    console.log('  tzid:', start.tzid);
    console.log('  toJSDate:', start.toJSDate().toISOString());
    console.log('---');
});
