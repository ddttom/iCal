const CalendarManager = require('./lib/calendar');
const ICAL = require('ical.js');

// Mock the CalendarManager to test _mapRowToEvent
class MockManager extends CalendarManager {
    constructor() {
        super();
    }
}

const manager = new MockManager();

const row = {
    uid: '123',
    summary: 'Test Event',
    startDate: '1978-05-11', // Date-only
    endDate: '1978-05-12',
    rrule: null,
    raw_data: ''
};

console.log('Testing _mapRowToEvent with date-only string...');
const event = manager._mapRowToEvent(row);

console.log('StartDate:', event.startDate.dateTime);
console.log('EndDate:', event.endDate.dateTime);

if (event.startDate.dateTime === '1978-05-11T00:00:00') {
    console.log('PASS: StartDate is correct (no timezone shift)');
} else {
    console.log('FAIL: StartDate is incorrect');
}
