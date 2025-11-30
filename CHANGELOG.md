# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2025-11-30

### Added

- **Time Standardization**: All times are now displayed in 24-hour format across the application.
- **UTC Storage**: Events are strictly stored in UTC format internally to prevent timezone issues.
- **Documentation**: Added `docs/problem.md` to document known issues and troubleshooting steps.

### Fixed

- **Crash**: Fixed a critical syntax error in `app.js` that caused the application to crash on event creation.
- **Time Display**: Fixed an issue where 15:00 events were displayed at 03:00 or with incorrect positioning.
- **Modal Behavior**: Fixed an issue where clicking outside the modal did not close it.

## [Unreleased]

## [1.2.0] - 2025-11-30

### Added

- **Event Icons**: Visual indicators for recurring (🔄) and single (🗓️) events in the list view.
- **View Raw Data**: New "View" button (👁️) on event cards to inspect the raw iCal data in a modal.

## [1.1.1] - 2025-11-30

### Fixed

- **CI/CD**: Resolved `npm run lint` failure by fixing `no-undef` errors in `public/app.js` and updating `eslint.config.js`.
- **Web Interface**: Fixed "No entries shown" and "Broken Close Button" bugs caused by an ID mismatch (`closeModal` vs `closeModalBtn`).

## [1.1.0] - 2025-11-30

### Added

- **Advanced iCal Properties**: Support for Attendees, Organizer, Status, Categories, and Alarms (VALARM).
- **Date Filtering**: Filter events by start and end date range.
- **Edit Event**: Functionality to update existing events via API and UI.
- **View Details**: Interactive event cards to view full details.
- **UI Overhaul**: Modern glassmorphism design, Floating Action Button (FAB), and toast notifications.
- **Sample Data**: Script to populate calendar with diverse sample events.

## [1.0.0] - 2025-11-30

### Added

- CLI tool for iCal file management (load, list, search, add, delete)
- Web GUI with Express server for managing calendar events
- Core CalendarManager class for iCal operations
- Support for standard iCal/ICS format using ical.js
- Interactive CLI prompts with inquirer
- RESTful API endpoints for event management
- UUID-based event identification
