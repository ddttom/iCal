const CalendarManager = require('./lib/calendar');
const path = require('path');

const calendarPath = path.join(__dirname, 'calendar.ics');
const calendarManager = new CalendarManager(calendarPath);

if (calendarManager.load()) {
    const events = calendarManager.listEvents();
    const teamLunch = events.find(e => e.summary === 'Team Lunch');
    
    if (teamLunch) {
        console.log('Summary:', teamLunch.summary);
        console.log('StartDate (Structured):', JSON.stringify(teamLunch.startDate, null, 2));
    } else {
        console.log('Team Lunch event not found');
    }
} else {
    console.log('Failed to load calendar');
}
