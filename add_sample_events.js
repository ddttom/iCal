const CalendarManager = require('./lib/calendar');
const path = require('path');

const calendarPath = path.resolve('calendar.ics');
const calendarManager = new CalendarManager(calendarPath);

// Load existing calendar or create new
if (!calendarManager.load()) {
    console.log('Creating new calendar...');
}

const now = new Date();

// Helper to add days
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// 1. Past Events (3)
const pastEvents = [
    {
        summary: 'Past Project Kickoff',
        description: 'Initial meeting for the legacy project.',
        location: 'Conference Room B',
        startDate: addDays(now, -10),
        endDate: addDays(now, -10) // 1 hour duration handled by default if same? No, let's be explicit or just start date.
    },
    {
        summary: 'Team Lunch',
        description: 'Monthly team lunch.',
        location: 'Pizza Place',
        startDate: addDays(now, -5),
        endDate: addDays(now, -5)
    },
    {
        summary: 'Code Review',
        description: 'Reviewing PR #123.',
        location: 'Online',
        startDate: addDays(now, -2),
        endDate: addDays(now, -2)
    }
];

// Fix end dates to be 1 hour after start
pastEvents.forEach(e => {
    e.endDate = new Date(e.startDate.getTime() + 60 * 60 * 1000);
    calendarManager.addEvent(e);
    console.log(`Added past event: ${e.summary}`);
});

// 2. Future Events (3)
const futureEvents = [
    {
        summary: 'Product Launch',
        description: 'Launch of the new feature.',
        location: 'Main Hall',
        startDate: addDays(now, 5),
        endDate: addDays(now, 5)
    },
    {
        summary: 'Client Meeting',
        description: 'Quarterly review with client.',
        location: 'Boardroom',
        startDate: addDays(now, 10),
        endDate: addDays(now, 10)
    },
    {
        summary: 'Hackathon',
        description: 'Internal hackathon.',
        location: 'Office',
        startDate: addDays(now, 20),
        endDate: addDays(now, 20)
    }
];

futureEvents.forEach(e => {
    e.endDate = new Date(e.startDate.getTime() + 60 * 60 * 1000);
    calendarManager.addEvent(e);
    console.log(`Added future event: ${e.summary}`);
});

// 3. Repeating Events (3)
const repeatingEvents = [
    {
        summary: 'Daily Standup',
        description: 'Daily team sync.',
        location: 'Online',
        startDate: addDays(now, 1), // Starts tomorrow
        endDate: new Date(addDays(now, 1).getTime() + 15 * 60 * 1000), // 15 mins
        rrule: { freq: 'DAILY', count: 10 }
    },
    {
        summary: 'Weekly Sync',
        description: 'Weekly progress report.',
        location: 'Meeting Room 1',
        startDate: addDays(now, 2),
        endDate: new Date(addDays(now, 2).getTime() + 60 * 60 * 1000),
        rrule: { freq: 'WEEKLY', count: 5 }
    },
    {
        summary: 'Monthly Town Hall',
        description: 'Company wide update.',
        location: 'Auditorium',
        startDate: addDays(now, 15),
        endDate: new Date(addDays(now, 15).getTime() + 90 * 60 * 1000),
        rrule: { freq: 'MONTHLY', count: 3 }
    }
];

repeatingEvents.forEach(e => {
    calendarManager.addEvent(e);
    console.log(`Added repeating event: ${e.summary}`);
});

if (calendarManager.save()) {
    console.log('Successfully saved all events to calendar.ics');
} else {
    console.error('Failed to save events.');
}
