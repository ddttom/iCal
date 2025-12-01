# AI Guidance

This file provides guidance to ai when working with code in this repository.

The user prefers british english

## Project Overview

iCal Manager is a Node.js application for managing iCal (.ics) files via both CLI and Web GUI. The application uses `ical.js` for parsing and generating iCalendar format files, with full support for recurring events (RRULE), advanced properties (attendees, organizers, categories, alarms), and a modern glassmorphism web interface.

## Essential Commands

### Development Workflow

```bash
# Install dependencies
npm install

# Start web server (default port 3000)
npm start
# or
node server.js

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage (requires 70% minimum across all metrics)
npm run test:coverage

# Lint code
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### CLI Usage

```bash
# List all events
node index.js list -f calendar.ics

# Search events
node index.js search "Meeting" -f calendar.ics

# Add event (interactive)
node index.js add -f calendar.ics

# Delete event by UID
node index.js delete <UID> -f calendar.ics
```

### Testing Workflow

```bash
# Run specific test file
npm test -- test/calendar.test.js

# Run tests with coverage and see detailed report
npm run test:coverage

# Clear Jest cache if tests behave unexpectedly
npm test -- --clearCache
```

## Architecture

### Core Components

1. **CalendarManager** ([lib/calendar.js](lib/calendar.js))
   - Central class managing all iCal operations
   - Uses `ical.js` library for parsing/serializing iCal data
   - Stores parsed data as `jcalData` (JCAL format) and `comp` (ICAL.Component)
   - Key methods: `load()`, `save()`, `listEvents()`, `searchEvents()`, `addEvent()`, `updateEvent()`, `deleteEvent()`
   - All dates are stored internally as UTC and converted via `ICAL.Time.fromJSDate()` and `.toJSDate()`

2. **Express Server** ([server.js](server.js))
   - REST API for web GUI operations
   - Default calendar file: `calendar.ics` in project root
   - Reloads calendar from disk on each API request to get latest changes
   - Endpoints: GET/POST `/api/events`, GET `/api/events/search`, PUT `/api/events/:uid`, DELETE `/api/events/:uid`

3. **CLI Interface** ([index.js](index.js))
   - Commander.js for CLI command structure
   - Inquirer.js for interactive prompts
   - Each command accepts `-f, --file <file>` option to specify calendar file path

4. **Web Frontend** ([public/app.js](public/app.js))
   - Vanilla JavaScript (no frameworks)
   - Features: List view, calendar views (month/week/day), search/filter, modal forms, toast notifications
   - All times displayed in 24-hour format
   - Calendar grid positioning uses `getUTCHours()` for consistency
   - Events are fetched via REST API and stored in `allEvents` array

### Data Flow

1. **Loading**: File → `fs.readFileSync()` → `ICAL.parse()` → `ICAL.Component` → `CalendarManager.comp`
2. **Events to Objects**: `comp.getAllSubcomponents('vevent')` → `ICAL.Event` wrapper → Plain objects with `uid`, `summary`, `startDate`, `endDate`, `description`, `location`, `isRecurring`, `raw`
3. **Saving**: `comp.toString()` → `fs.writeFileSync()` → File

### Time Handling

**CRITICAL**: This application standardizes on UTC storage with 24-hour display format.

- **Backend**: All dates stored as JavaScript Date objects, converted to/from `ICAL.Time` (UTC)
- **Frontend**:
  - Form inputs use `datetime-local` (browser local time)
  - On submit, append `:00Z` to force UTC interpretation
  - Grid positioning uses `getUTCHours()` not `getHours()`
  - Display formatting uses `toLocaleTimeString('en-GB', {timeZone: 'UTC', hour12: false})`
- **Known Issue**: See [docs/problem.md](docs/problem.md) for historical timezone debugging details

### Advanced iCal Properties

The app supports beyond basic summary/description/location:
- **Recurring Events**: `rrule` property (ICAL.Recur) for Daily/Weekly/Monthly patterns
- **Organizer**: With `cn` (common name) parameter for organizer name
- **Attendees**: Array with email, name, role, status (PARTSTAT)
- **Status**: TENTATIVE/CONFIRMED/CANCELLED
- **Categories**: Array of strings
- **Alarms**: VALARM subcomponent with trigger time and description

## Code Style & Testing

### ESLint Configuration

- **Indentation**: 4 spaces (enforced)
- **Quotes**: Single quotes
- **Semicolons**: Required
- **File-specific globals**: Node.js globals in backend, browser globals in `public/**/*.js`, Jest globals in tests

### Test Structure

- Test files: `test/**/*.test.js`
- Uses Jest with `node` environment
- Coverage threshold: 70% for branches/functions/lines/statements
- Tests use temporary files in `test/temp/` (cleaned up after each test)
- Fixture files in `test/fixtures/sample.ics`

### Important Testing Patterns

```javascript
describe('FeatureName', () => {
    beforeAll(() => { /* setup test directory */ });
    afterAll(() => { /* cleanup test directory */ });
    afterEach(() => { /* cleanup test files */ });

    describe('methodName', () => {
        it('should describe expected behavior', () => {
            // Test implementation
        });
    });
});
```

## Common Pitfalls

1. **Forgetting to reload**: Server must call `calendarManager.load()` before each read operation since CLI or other processes might modify the file
2. **Date conversion**: Always use `ICAL.Time.fromJSDate()` when setting dates, and `.toJSDate()` when reading
3. **Component vs Event**: Use `ICAL.Event` wrapper for convenient property access, but underlying component needed for advanced operations
4. **Duplicate variable declarations**: Watch for copy-paste errors in large functions (see docs/problem.md)
5. **Browser timezone**: Always use `getUTCHours()` for grid positioning, not `getHours()` (local time)

## File References

- Core logic: [lib/calendar.js](lib/calendar.js), [lib/utils.js](lib/utils.js)
- Entry points: [server.js](server.js), [index.js](index.js)
- Frontend: [public/app.js](public/app.js), [public/index.html](public/index.html), [public/styles.css](public/styles.css)
- Tests: [test/calendar.test.js](test/calendar.test.js), [test/server.test.js](test/server.test.js), [test/advanced_properties.test.js](test/advanced_properties.test.js), [test/time_conversion.test.js](test/time_conversion.test.js)
- Config: [jest.config.js](jest.config.js), [eslint.config.js](eslint.config.js)
- CI/CD: [.github/workflows/ci.yml](.github/workflows/ci.yml) - runs lint, test matrix (Node 18/20/22), coverage upload to Codecov

## Contribution Guidelines

From [CONTRIBUTING.md](CONTRIBUTING.md):

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Format

Follow Conventional Commits:
- `feat(scope): description` - New feature
- `fix(scope): description` - Bug fix
- `docs(scope): description` - Documentation
- `test(scope): description` - Test changes
- `refactor(scope): description` - Code refactoring
- `chore(scope): description` - Maintenance

### Pre-commit Checklist

1. `npm run lint` must pass
2. `npm test` must pass
3. Coverage must meet 70% threshold
4. Update CHANGELOG.md if applicable
