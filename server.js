const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const CalendarManager = require('./lib/calendar');
const { fileExists } = require('./lib/utils');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/lib/ical.js', express.static(path.join(__dirname, 'node_modules/ical.js/dist/ical.min.js')));

// Initialize Calendar Manager with Database
const calendarManager = new CalendarManager();

// Initialize DB and start server
(async () => {
    try {
        await calendarManager.init();
        
        // Check if we need to seed initial data
        // For now, let's assume if DB is empty we might want to import default calendar.ics if exists
        // But let's leave that to manual import or CLI for now to avoid auto-importing 110MB file on restart
        
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    }
})();

// API Endpoints

// Get all events (paginated)
app.get('/api/events', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const { events, total } = await calendarManager.listEvents(limit, offset);
        res.json({
            events,
            total,
            totalDatabaseCount: total, // For consistency with search endpoint
            page,
            limit
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search events
app.get('/api/events/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const startDate = req.query.start;
        const endDate = req.query.end;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        if (!query && !startDate && !endDate) {
            return res.status(400).json({ error: 'At least one filter parameter (q, start, end) is required' });
        }

        const { events, total, totalDatabaseCount } = await calendarManager.searchEvents(query, startDate, endDate, limit, offset);
        res.json({
            events,
            total,
            totalDatabaseCount,
            page,
            limit
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add event
app.post('/api/events', async (req, res) => {
    try {
        const eventData = req.body;
        if (!eventData.summary) {
            return res.status(400).json({ error: 'Summary is required' });
        }
        
        const uid = await calendarManager.addEvent(eventData);
        res.status(201).json({ uid, message: 'Event added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update event
app.put('/api/events/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const updates = req.body;
        
        const success = await calendarManager.updateEvent(uid, updates);
        if (success) {
            res.json({ message: 'Event updated successfully' });
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete event
app.delete('/api/events/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        const success = await calendarManager.deleteEvent(uid);
        if (success) {
            res.json({ message: 'Event deleted successfully' });
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export Calendar
app.get('/api/export', async (req, res) => {
    try {
        const icsData = await calendarManager.exportToICS();
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', 'attachment; filename=calendar.ics');
        res.send(icsData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
