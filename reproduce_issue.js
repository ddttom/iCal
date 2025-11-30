const CalendarManager = require('./lib/calendar');
const path = require('path');
const fs = require('fs');

const testDir = path.join(__dirname, 'test', 'temp');
if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
}

const testCalendarPath = path.join(testDir, 'repro-calendar.ics');
if (fs.existsSync(testCalendarPath)) {
    fs.unlinkSync(testCalendarPath);
}

console.log('Initializing CalendarManager...');
const calendarManager = new CalendarManager(testCalendarPath);

console.log('Adding event...');
try {
    calendarManager.addEvent({
        summary: 'Test Event',
        startDate: new Date()
    });
    console.log('Event added.');
} catch (e) {
    console.error('Error adding event:', e);
}

console.log('Saving calendar...');
const success = calendarManager.save();
if (success) {
    console.log('Save successful!');
} else {
    console.error('Save failed!');
}
