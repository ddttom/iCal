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
        const [rows, total, totalDatabaseCount] = await Promise.all([
            this.db.searchEvents(query, startDate, endDate, limit, offset),
            this.db.getSearchCount(query, startDate, endDate),
            this.db.getEventCount()
        ]);
        return {
            events: rows.map(this._mapRowToEvent),
            total,
            totalDatabaseCount
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

        // Helper to ensure proper ISO 8601 format for ical.js
        const ensureSeconds = (str) => {
            if (!str) return null;
            if (str instanceof Date) return str.toISOString();
            if (typeof str !== 'string') return String(str);

            // Handle datetime-local format (YYYY-MM-DDTHH:mm)
            // ical.js needs YYYY-MM-DDTHH:mm:ss format
            if (str.length === 16 && str.includes('T')) {
                return str + ':00';
            }

            // If already has seconds, return as-is
            return str;
        };

        console.log('Parsing dates:', eventData.startDate, eventData.endDate);

        try {
            // Parse and set start date
            const startDateStr = ensureSeconds(eventData.startDate);
            console.log('Start date after ensureSeconds:', startDateStr.replace(/\r?\n/g, ""));

            if (!startDateStr) {
                throw new Error('Start date is required');
            }

            event.startDate = ICAL.Time.fromString(startDateStr);

            // Parse and set end date
            if (eventData.endDate) {
                const endDateStr = ensureSeconds(eventData.endDate);
                console.log('End date after ensureSeconds:', endDateStr.replace(/\r?\n/g, ""));
                event.endDate = ICAL.Time.fromString(endDateStr);
            } else {
                // Default duration 1 hour if not specified
                const end = event.startDate.clone();
                end.adjust(0, 1, 0, 0);
                event.endDate = end;
            }
        } catch (e) {
            console.error('Date parsing error:', e);
            throw new Error(`Invalid Date Time: ${e.message}`);
        }

        if (eventData.rrule) {
            event.component.addPropertyWithValue('rrule', ICAL.Recur.fromString(eventData.rrule));
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

        console.log('Creating event:', uid, eventData.summary);

        // Store parsed dates as ISO strings in database
        const dbEvent = {
            uid,
            summary: eventData.summary,
            description: eventData.description,
            location: eventData.location,
            startDate: event.startDate.toString(), // Store as ISO string
            endDate: event.endDate ? event.endDate.toString() : null,
            rrule: eventData.rrule,
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
            recurrence: row.rrule,
            isAllDay: row.startDate.length === 10, // YYYY-MM-DD is 10 chars
            raw: row.raw_data
        };
    }
}

module.exports = CalendarManager;
