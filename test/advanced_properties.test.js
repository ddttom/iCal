const CalendarManager = require('../lib/calendar');
const path = require('path');
const fs = require('fs');
const ICAL = require('ical.js');

const testCalendarPath = path.join(__dirname, 'temp', 'test-advanced.ics');
const testDir = path.join(__dirname, 'temp');

describe('Advanced iCal Properties', () => {
    let calendarManager;

    beforeAll(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    beforeEach(() => {
        if (fs.existsSync(testCalendarPath)) {
            fs.unlinkSync(testCalendarPath);
        }
        calendarManager = new CalendarManager(testCalendarPath);
    });

    afterAll(() => {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    it('should add an event with organizer and attendees', () => {
        const eventData = {
            summary: 'Meeting with Team',
            startDate: new Date(),
            organizer: { name: 'Boss', email: 'boss@example.com' },
            attendees: [
                { name: 'Alice', email: 'alice@example.com', role: 'REQ-PARTICIPANT', status: 'ACCEPTED' },
                { name: 'Bob', email: 'bob@example.com', role: 'OPT-PARTICIPANT' }
            ]
        };

        calendarManager.addEvent(eventData);
        calendarManager.save();

        // Verify file content
        const content = fs.readFileSync(testCalendarPath, 'utf-8');
        const jcal = ICAL.parse(content);
        const comp = new ICAL.Component(jcal);
        const vevent = comp.getFirstSubcomponent('vevent');

        // vevent is ICAL.Component
        const organizer = vevent.getFirstProperty('organizer');
        expect(organizer.getFirstValue()).toBe('mailto:boss@example.com');
        expect(organizer.getParameter('cn')).toBe('Boss');

        const attendees = vevent.getAllProperties('attendee');
        expect(attendees.length).toBe(2);
        
        const alice = attendees.find(a => a.getFirstValue() === 'mailto:alice@example.com');
        expect(alice.getParameter('cn')).toBe('Alice');
        expect(alice.getParameter('role')).toBe('REQ-PARTICIPANT');
        expect(alice.getParameter('partstat')).toBe('ACCEPTED');
    });

    it('should add an event with status and categories', () => {
        const eventData = {
            summary: 'Project Review',
            startDate: new Date(),
            status: 'CONFIRMED',
            categories: ['WORK', 'PROJECT']
        };

        calendarManager.addEvent(eventData);
        calendarManager.save();

        const content = fs.readFileSync(testCalendarPath, 'utf-8');
        const jcal = ICAL.parse(content);
        const comp = new ICAL.Component(jcal);
        const vevent = comp.getFirstSubcomponent('vevent');

        expect(vevent.getFirstPropertyValue('status')).toBe('CONFIRMED');
        
        const cats = vevent.getFirstProperty('categories').getValues();
        // ical.js returns array for multi-value property
        expect(cats).toContain('WORK');
        expect(cats).toContain('PROJECT');
    });

    it('should add an event with an alarm', () => {
        const eventData = {
            summary: 'Alarm Test',
            startDate: new Date(),
            alarm: {
                trigger: '-PT30M',
                description: 'Wake up!'
            }
        };

        calendarManager.addEvent(eventData);
        calendarManager.save();

        const content = fs.readFileSync(testCalendarPath, 'utf-8');
        const jcal = ICAL.parse(content);
        const comp = new ICAL.Component(jcal);
        const vevent = comp.getFirstSubcomponent('vevent');
        const valarm = vevent.getFirstSubcomponent('valarm');

        expect(valarm).toBeDefined();
        expect(valarm.getFirstPropertyValue('action')).toBe('DISPLAY');
        
        // Trigger returns an ICAL.Duration object
        const trigger = valarm.getFirstPropertyValue('trigger');
        expect(trigger.toString()).toBe('-PT30M');
        
        expect(valarm.getFirstPropertyValue('description')).toBe('Wake up!');
    });
});
