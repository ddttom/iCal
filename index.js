#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const path = require('path');
const CalendarManager = require('./lib/calendar');
const { fileExists } = require('./lib/utils');

const program = new Command();
const calendarManager = new CalendarManager();

program
  .name('ical-cli')
  .description('CLI to manage iCal files')
  .version('1.0.0');

program
  .command('load <file>')
  .description('Load an iCal file')
  .action((file) => {
    const filePath = path.resolve(file);
    if (!fileExists(filePath)) {
      console.error(`File not found: ${filePath}`);
      // Ask if user wants to create a new one
      inquirer.prompt([
        {
          type: 'confirm',
          name: 'create',
          message: 'File does not exist. Do you want to create a new calendar at this path?',
          default: true
        }
      ]).then(answers => {
        if (answers.create) {
            calendarManager.filePath = filePath;
            calendarManager.addEvent({ summary: 'Initial Event', startDate: new Date() }); // Initialize
            if (calendarManager.save()) {
                console.log(`Created new calendar at ${filePath}`);
            }
        }
      });
      return;
    }
    calendarManager.filePath = filePath;
    if (calendarManager.load()) {
      console.log(`Loaded calendar from ${filePath}`);
    }
  });

program
  .command('list')
  .description('List all events')
  .option('-f, --file <file>', 'Path to iCal file')
  .action((options) => {
    if (options.file) {
        calendarManager.filePath = path.resolve(options.file);
        calendarManager.load();
    }
    
    if (!calendarManager.comp && !options.file) {
        console.error('No calendar loaded. Use "load <file>" or provide -f option.');
        return;
    }

    const events = calendarManager.listEvents();
    if (events.length === 0) {
        console.log('No events found.');
    } else {
        console.table(events.map(e => ({
            Summary: e.summary,
            Start: e.startDate ? e.startDate.toLocaleString() : 'N/A',
            UID: e.uid
        })));
    }
  });

program
  .command('search <query>')
  .description('Search events')
  .option('-f, --file <file>', 'Path to iCal file')
  .action((query, options) => {
    if (options.file) {
        calendarManager.filePath = path.resolve(options.file);
        calendarManager.load();
    }

    if (!calendarManager.comp && !options.file) {
        console.error('No calendar loaded. Use "load <file>" or provide -f option.');
        return;
    }

    const events = calendarManager.searchEvents(query);
    if (events.length === 0) {
        console.log('No matching events found.');
    } else {
        console.table(events.map(e => ({
            Summary: e.summary,
            Start: e.startDate ? e.startDate.toLocaleString() : 'N/A',
            UID: e.uid
        })));
    }
  });

program
  .command('add')
  .description('Add a new event')
  .option('-f, --file <file>', 'Path to iCal file')
  .action(async (options) => {
    let filePath = options.file ? path.resolve(options.file) : calendarManager.filePath;

    if (!filePath) {
        const answer = await inquirer.prompt([{
            type: 'input',
            name: 'file',
            message: 'Path to iCal file:'
        }]);
        filePath = path.resolve(answer.file);
    }

    calendarManager.filePath = filePath;
    if (fileExists(filePath)) {
        calendarManager.load();
    }

    const answers = await inquirer.prompt([
        { type: 'input', name: 'summary', message: 'Event Summary:' },
        { type: 'input', name: 'description', message: 'Description (optional):' },
        { type: 'input', name: 'location', message: 'Location (optional):' },
        { type: 'input', name: 'startDate', message: 'Start Date (YYYY-MM-DD HH:mm):' },
        { type: 'input', name: 'endDate', message: 'End Date (YYYY-MM-DD HH:mm) (optional):' }
    ]);

    const eventData = {
        summary: answers.summary,
        description: answers.description,
        location: answers.location,
        startDate: answers.startDate ? new Date(answers.startDate) : new Date(),
        endDate: answers.endDate ? new Date(answers.endDate) : null
    };

    const uid = calendarManager.addEvent(eventData);
    if (calendarManager.save()) {
        console.log(`Event added successfully. UID: ${uid}`);
    }
  });

program
  .command('delete <uid>')
  .description('Delete an event by UID')
  .option('-f, --file <file>', 'Path to iCal file')
  .action((uid, options) => {
    if (options.file) {
        calendarManager.filePath = path.resolve(options.file);
        calendarManager.load();
    }

    if (!calendarManager.comp && !options.file) {
        console.error('No calendar loaded. Use "load <file>" or provide -f option.');
        return;
    }

    if (calendarManager.deleteEvent(uid)) {
        if (calendarManager.save()) {
            console.log(`Event ${uid} deleted.`);
        }
    } else {
        console.error(`Event ${uid} not found.`);
    }
  });

program.parse(process.argv);
