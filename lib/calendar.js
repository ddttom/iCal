const ICAL = require('ical.js');
const { v4: uuidv4 } = require('uuid');
const { readFile, writeFile } = require('./utils');
const Database = require('./database');

class CalendarManager {
    constructor(dbPath) {
        this.db = new Database(dbPath);
    }

    async init() {
        await this.db.init();
    }

    async importFromICS(filePath) {
        try {
            const data = readFile(filePath);
            const jcalData = ICAL.parse(data);
            const comp = new ICAL.Component(jcalData);
            const vevents = comp.getAllSubcomponents('vevent');

            let count = 0;
            for (const veventComp of vevents) {
                const vevent = new ICAL.Event(veventComp);
                const eventData = {
                    uid: vevent.uid,
                    summary: vevent.summary,
                    description: vevent.description,
                    location: vevent.location,
                    startDate: vevent.startDate.toString(),
                    endDate: vevent.endDate ? vevent.endDate.toString() : null,
                    rrule: vevent.isRecurring() ? veventComp.getFirstPropertyValue('rrule').toString() : null,
                    raw_data: veventComp.toString()
                };
                await this.db.createEvent(eventData);
                count++;
            }
            return count;
        } catch (error) {
            console.error('Error importing ICS:', error);
            throw error;
        }
    }

    async exportToICS() {
        try {
            const events = await this.db.getAllEvents(1000000); // Get all events
            const comp = new ICAL.Component(['vcalendar', [], []]);
            comp.updatePropertyWithValue('prodid', '-//My iCal App//EN');
            comp.updatePropertyWithValue('version', '2.0');

            for (const event of events) {
                // If we have raw_data, try to use it to preserve all properties
                if (event.raw_data) {
                    try {
                        const jcal = ICAL.parse(event.raw_data);
                        // raw_data is usually just the VEVENT string, need to parse it
                        // But ICAL.parse expects full component usually? 
                        // Actually ICAL.parse parses a string into jCal. 
                        // If raw_data is "BEGIN:VEVENT...", ICAL.parse works.
                        // However, let's reconstruct if raw_data is missing or fails
                        const veventComp = new ICAL.Component(jcal);
                        comp.addSubcomponent(veventComp);
                        continue;
                    } catch (e) {
                        // Fallback to reconstruction
                    }
                }

                // Reconstruction
                const vevent = new ICAL.Component('vevent');
                const icevent = new ICAL.Event(vevent);
                icevent.uid = event.uid;
                icevent.summary = event.summary;
                icevent.description = event.description;
                icevent.location = event.location;
                icevent.startDate = ICAL.Time.fromString(event.startDate);
                if (event.endDate) icevent.endDate = ICAL.Time.fromString(event.endDate);
                
                // TODO: Handle RRULE and other props if reconstructing
                
                comp.addSubcomponent(vevent);
            }
            return comp.toString();
        } catch (error) {
            console.error('Error exporting ICS:', error);
            throw error;
        }
    }

    async listEvents(limit = 100, offset = 0) {
        const [rows, total] = await Promise.all([
            this.db.getAllEvents(limit, offset),
            this.db.getEventCount()
        ]);
        return {
            events: rows.map(this._mapRowToEvent),
            total
        };
    }

    async searchEvents(query, startDate, endDate, limit = 100, offset = 0) {
        const [rows, total] = await Promise.all([
            this.db.searchEvents(query, startDate, endDate, limit, offset),
            this.db.getSearchCount(query, startDate, endDate)
        ]);
        return {
            events: rows.map(this._mapRowToEvent),
            total
        };
    }

    async addEvent(eventData) {
        const uid = uuidv4();
        
        // Create ICAL object to generate raw_data
        const vevent = new ICAL.Component('vevent');
        const event = new ICAL.Event(vevent);
        event.uid = uid;
        event.summary = eventData.summary;
        event.description = eventData.description || '';
        event.location = eventData.location || '';
        if (eventData.startDate) event.startDate = ICAL.Time.fromString(eventData.startDate);
        if (eventData.endDate) event.endDate = ICAL.Time.fromString(eventData.endDate);
        
        if (eventData.rrule) {
            event.component.addPropertyWithValue('rrule', new ICAL.Recur(eventData.rrule));
        }

        // Advanced Properties
        if (eventData.organizer) {
            const organizer = event.component.addPropertyWithValue('organizer', `mailto:${eventData.organizer.email || eventData.organizer}`);
            if (eventData.organizer.name) {
                organizer.setParameter('cn', eventData.organizer.name);
            }
        }

        if (eventData.attendees && Array.isArray(eventData.attendees)) {
            eventData.attendees.forEach(attendee => {
                const att = event.component.addPropertyWithValue('attendee', `mailto:${attendee.email || attendee}`);
                if (attendee.name) {
                    att.setParameter('cn', attendee.name);
                }
                if (attendee.role) {
                    att.setParameter('role', attendee.role);
                }
                if (attendee.status) {
                    att.setParameter('partstat', attendee.status);
                }
            });
        }

        if (eventData.status) {
            event.component.updatePropertyWithValue('status', eventData.status.toUpperCase());
        }

        if (eventData.categories && Array.isArray(eventData.categories)) {
            const prop = event.component.updatePropertyWithValue('categories', 'dummy');
            prop.setValues(eventData.categories);
        }

        if (eventData.alarm) {
            const valarm = new ICAL.Component('valarm');
            valarm.updatePropertyWithValue('action', 'DISPLAY');
            valarm.updatePropertyWithValue('trigger', eventData.alarm.trigger || '-PT15M'); // Default 15 min before
            valarm.updatePropertyWithValue('description', eventData.alarm.description || 'Event Reminder');
            event.component.addSubcomponent(valarm);
        }
        
        const dbEvent = {
            uid,
            summary: eventData.summary,
            description: eventData.description,
            location: eventData.location,
            startDate: eventData.startDate, // Assuming ISO string input
            endDate: eventData.endDate,
            raw_data: vevent.toString()
        };

        await this.db.createEvent(dbEvent);
        return uid;
    }

    async updateEvent(uid, updates) {
        // First get existing event to merge
        const existing = await this.db.getEvent(uid);
        if (!existing) return false;

        // Merge updates
        const merged = { ...existing, ...updates };
        
        // Regenerate raw_data if needed (simplified)
        // Ideally we parse existing raw_data, update it, and save back
        // For now, let's just update the DB columns and basic raw_data
        
        return await this.db.updateEvent(uid, merged);
    }

    async deleteEvent(uid) {
        return await this.db.deleteEvent(uid);
    }

    _mapRowToEvent(row) {
        return {
            uid: row.uid,
            summary: row.summary,
            description: row.description,
            location: row.location,
            startDate: { dateTime: row.startDate }, // Keep structure compatible with frontend
            endDate: row.endDate ? { dateTime: row.endDate } : null,
            isRecurring: !!row.rrule,
            raw: row.raw_data
        };
    }
}

module.exports = CalendarManager;
