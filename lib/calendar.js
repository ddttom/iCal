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

    searchEvents(query, startDate = null, endDate = null) {
        const events = this.listEvents();
        const lowerQuery = query ? query.toLowerCase() : '';
        
        return events.filter(event => {
            // Text search
            const matchesText = !lowerQuery || 
                   (event.summary && event.summary.toLowerCase().includes(lowerQuery)) ||
                   (event.description && event.description.toLowerCase().includes(lowerQuery)) ||
                   (event.location && event.location.toLowerCase().includes(lowerQuery));

            if (!matchesText) return false;

            // Date filtering
            // Event overlaps with range if: Event Start < Range End AND Event End > Range Start
            // If event has no end date, assume it's a point in time (Start < Range End AND Start >= Range Start)
            
            if (startDate) {
                const rangeStart = new Date(startDate);
                const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
                if (eventEnd < rangeStart) return false;
            }

            if (endDate) {
                const rangeEnd = new Date(endDate);
                // Set range end to end of day if it's just a date, but let's assume the caller handles precision
                // Actually, let's make it inclusive of the end date by setting time to 23:59:59 if needed, 
                // but for now strict comparison.
                const eventStart = new Date(event.startDate);
                if (eventStart > rangeEnd) return false;
            }

            return true;
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

        // Advanced Properties Updates
        if (updates.status) {
            veventComp.updatePropertyWithValue('status', updates.status.toUpperCase());
        }

        if (updates.categories) {
            const prop = veventComp.updatePropertyWithValue('categories', 'dummy');
            prop.setValues(updates.categories);
        }

        // For complex properties like attendees/organizer, it's often easier to remove and re-add
        // But for now, let's just support status and categories in update as requested by the plan's scope implication (usually updates are partial).
        // If full update is needed, we'd need more complex logic. Let's stick to simple property updates first.
        
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
