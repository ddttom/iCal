const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const CalendarManager = require('./lib/calendar');
const { fileExists } = require('./lib/utils');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Default calendar file for the GUI
const defaultCalendarPath = path.resolve('calendar.ics');
const calendarManager = new CalendarManager(defaultCalendarPath);

// Ensure calendar exists
if (!fileExists(defaultCalendarPath)) {
    calendarManager.addEvent({ summary: 'Welcome Event', startDate: new Date() });
    calendarManager.save();
} else {
    calendarManager.load();
}

// API Endpoints

// Get all events
app.get('/api/events', (req, res) => {
    calendarManager.load(); // Reload to get latest changes
    const events = calendarManager.listEvents();
    res.json(events);
});

// Search events
app.get('/api/events/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    calendarManager.load();
    const events = calendarManager.searchEvents(query);
    res.json(events);
});

// Add event
app.post('/api/events', (req, res) => {
    const eventData = req.body;
    if (!eventData.summary) {
        return res.status(400).json({ error: 'Summary is required' });
    }
    
    // Ensure dates are Date objects
    if (eventData.startDate) eventData.startDate = new Date(eventData.startDate);
    if (eventData.endDate) eventData.endDate = new Date(eventData.endDate);

    const uid = calendarManager.addEvent(eventData);
    if (calendarManager.save()) {
        res.status(201).json({ uid, message: 'Event added successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save event' });
    }
});

// Delete event
app.delete('/api/events/:uid', (req, res) => {
    const uid = req.params.uid;
    if (calendarManager.deleteEvent(uid)) {
        if (calendarManager.save()) {
            res.json({ message: 'Event deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save changes' });
        }
    } else {
        res.status(404).json({ error: 'Event not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
