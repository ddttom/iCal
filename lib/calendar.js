const ICAL = require('ical.js');
const { v4: uuidv4 } = require('uuid');
const { readFile, writeFile } = require('./utils');

class CalendarManager {
    constructor(filePath) {
        this.filePath = filePath;
        this.jcalData = null;
        this.comp = null;
    }

    load() {
        try {
            const data = readFile(this.filePath);
            this.jcalData = ICAL.parse(data);
            this.comp = new ICAL.Component(this.jcalData);
            return true;
        } catch (error) {
            console.error('Error loading calendar:', error.message);
            return false;
        }
    }

    save() {
        try {
            const iCalString = this.comp.toString();
            writeFile(this.filePath, iCalString);
            return true;
        } catch (error) {
            console.error('Error saving calendar:', error.message);
            return false;
        }
    }

    listEvents() {
        if (!this.comp) return [];
        const events = this.comp.getAllSubcomponents('vevent');
        return events.map(event => {
            const vevent = new ICAL.Event(event);
            return {
                uid: vevent.uid,
                summary: vevent.summary,
                startDate: vevent.startDate.toJSDate(),
                endDate: vevent.endDate ? vevent.endDate.toJSDate() : null,
                description: vevent.description,
                location: vevent.location
            };
        });
    }

    searchEvents(query) {
        const events = this.listEvents();
        const lowerQuery = query.toLowerCase();
        return events.filter(event => {
            return (event.summary && event.summary.toLowerCase().includes(lowerQuery)) ||
                   (event.description && event.description.toLowerCase().includes(lowerQuery)) ||
                   (event.location && event.location.toLowerCase().includes(lowerQuery));
        });
    }

    addEvent(eventData) {
        if (!this.comp) {
            // Initialize a new calendar if one doesn't exist or wasn't loaded
            this.comp = new ICAL.Component(['vcalendar', [], []]);
            this.comp.updatePropertyWithValue('prodid', '-//My iCal App//EN');
            this.comp.updatePropertyWithValue('version', '2.0');
        }

        const vevent = new ICAL.Component('vevent');
        const event = new ICAL.Event(vevent);

        event.uid = uuidv4();
        event.summary = eventData.summary;
        event.description = eventData.description || '';
        event.location = eventData.location || '';
        
        if (eventData.startDate) {
            event.startDate = ICAL.Time.fromJSDate(new Date(eventData.startDate));
        }
        if (eventData.endDate) {
            event.endDate = ICAL.Time.fromJSDate(new Date(eventData.endDate));
        }

        this.comp.addSubcomponent(vevent);
        return event.uid;
    }

    updateEvent(uid, updates) {
        if (!this.comp) return false;
        const vevents = this.comp.getAllSubcomponents('vevent');
        const veventComp = vevents.find(v => v.getFirstPropertyValue('uid') === uid);

        if (!veventComp) return false;

        const event = new ICAL.Event(veventComp);

        if (updates.summary) event.summary = updates.summary;
        if (updates.description) event.description = updates.description;
        if (updates.location) event.location = updates.location;
        if (updates.startDate) event.startDate = ICAL.Time.fromJSDate(new Date(updates.startDate));
        if (updates.endDate) event.endDate = ICAL.Time.fromJSDate(new Date(updates.endDate));

        return true;
    }

    deleteEvent(uid) {
        if (!this.comp) return false;
        const vevents = this.comp.getAllSubcomponents('vevent');
        const veventComp = vevents.find(v => v.getFirstPropertyValue('uid') === uid);

        if (!veventComp) return false;

        this.comp.removeSubcomponent(veventComp);
        return true;
    }
}

module.exports = CalendarManager;
