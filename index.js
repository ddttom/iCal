#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const CalendarManager = require('./lib/calendar');
const { fileExists } = require('./lib/utils');

const program = new Command();
const calendarManager = new CalendarManager();

// Initialize DB and start CLI
(async () => {
    try {
        await calendarManager.init();
        program.parse(process.argv);
    } catch (err) {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    }
})();

program
    .name('ical-cli')
    .description('CLI to manage iCal files via SQLite Database')
    .version('1.0.0');

program
    .command('load <file>')
    .description('Import an iCal file into the database')
    .action(async (file) => {
        const filePath = path.resolve(file);
        if (!fileExists(filePath)) {
            console.error(`File not found: ${filePath}`);
            return;
        }
        
        console.log(`Importing ${filePath}...`);
        try {
            const count = await calendarManager.importFromICS(filePath);
            console.log(`Successfully imported ${count} events.`);
        } catch (err) {
            console.error('Import failed:', err.message);
        }
    });

program
    .command('export <file>')
    .description('Export database to an iCal file')
    .action(async (file) => {
        const filePath = path.resolve(file);
        try {
            const icsData = await calendarManager.exportToICS();
            const fs = require('fs');
            fs.writeFileSync(filePath, icsData);
            console.log(`Exported calendar to ${filePath}`);
        } catch (err) {
            console.error('Export failed:', err.message);
        }
    });

program
    .command('list')
    .description('List all events (first 100)')
    .action(async () => {
        try {
            const events = await calendarManager.listEvents(100);
            if (events.length === 0) {
                console.log('No events found.');
            } else {
                console.table(events.map(e => ({
                    Summary: e.summary,
                    Start: e.startDate ? e.startDate.dateTime : 'N/A',
                    UID: e.uid
                })));
            }
        } catch (err) {
            console.error('Error listing events:', err.message);
        }
    });

program
    .command('search <query>')
    .description('Search events')
    .action(async (query) => {
        try {
            const events = await calendarManager.searchEvents(query);
            if (events.length === 0) {
                console.log('No matching events found.');
            } else {
                console.table(events.map(e => ({
                    Summary: e.summary,
                    Start: e.startDate ? e.startDate.dateTime : 'N/A',
                    UID: e.uid
                })));
            }
        } catch (err) {
            console.error('Error searching events:', err.message);
        }
    });

program
    .command('add')
    .description('Add a new event')
    .action(async () => {
        const answers = await inquirer.prompt([
            { type: 'input', name: 'summary', message: 'Event Summary:' },
            { type: 'input', name: 'description', message: 'Description (optional):' },
            { type: 'input', name: 'location', message: 'Location (optional):' },
            { type: 'input', name: 'startDate', message: 'Start Date (YYYY-MM-DDTHH:mm:ss):' },
            { type: 'input', name: 'endDate', message: 'End Date (YYYY-MM-DDTHH:mm:ss) (optional):' }
        ]);

        const eventData = {
            summary: answers.summary,
            description: answers.description,
            location: answers.location,
            startDate: answers.startDate, // Expect ISO string
            endDate: answers.endDate || null
        };

        try {
            const uid = await calendarManager.addEvent(eventData);
            console.log(`Event added successfully. UID: ${uid}`);
        } catch (err) {
            console.error('Error adding event:', err.message);
        }
    });

program
    .command('delete <uid>')
    .description('Delete an event by UID')
    .action(async (uid) => {
        try {
            if (await calendarManager.deleteEvent(uid)) {
                console.log(`Event ${uid} deleted.`);
            } else {
                console.error(`Event ${uid} not found.`);
            }
        } catch (err) {
            console.error('Error deleting event:', err.message);
        }
    });


