# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2025-12-02

### Added

- **UI Overhaul**: Complete redesign of the header and action buttons for a professional look.
- **Fixed Header**: Header is now fixed at the top with a glassmorphism effect.
- **Phosphor Icons**: Replaced all emojis with high-quality Phosphor Icons.
- **Style Guide**: Added `docs/style-guide.md` to document the design system.
- **Toolbar**: Dedicated toolbar for search and filters to prevent layout overlaps.

## [1.6.0] - 2025-12-02

### Added

- **iCal Import**: New feature allowing users to import events by pasting iCal (.ics) text content directly into the application.
- **Frontend Parsing**: Integrated `ical.js` from npm to handle iCal parsing on the client side.

### Changed

- **Dependency Management**: Updated `server.js` to serve `ical.js` directly from `node_modules`, ensuring consistent versioning.

## [1.5.0] - 2025-12-01

### Added

- **Interactive Calendar Library**: Integrated `jcalendar.js` to replace the manual calendar implementation, providing a more robust and feature-rich calendar view.
- **Settings Panel**: Added a settings panel to toggle themes (Light/Dark) and time formats (12h/24h).
- **Edit Event Actions**: Added "Cancel" and "Delete" buttons to the Edit Event modal for better user control.

### Changed

- **Calendar UI**: Completely overhauled the calendar view using `jcalendar.js`.
- **Script Loading**: Optimized script loading order in `index.html` to ensure dependencies are loaded correctly.

### Fixed

- **Event Loading**: Resolved issues with event loading and rendering by fixing API usage and script dependencies.

## [1.4.1] - 2025-12-01

### Added

- **View Persistence**: The application now remembers your last selected calendar view (List, Month, Week, or Day) across sessions.

### Fixed

- **Floating Time Support**: Fixed an issue where events without a timezone (like "Team Lunch") were displayed incorrectly due to UTC conversion. They now appear at their literal time (e.g., 12:00 PM) regardless of timezone.
- **List View Dates**: Resolved an "Invalid Date" error in the List View caused by the new structured time data format.

## [1.4.0] - 2025-12-01

### Added

- **Dark Mode**: Full dark theme support with a toggle switch in the header.
- **UI Enhancements**:
  - **Background Shapes**: Colorful gradient blobs for a modern, depth-filled look.
  - **Header Actions**: Added "New Event" button and Theme Toggle to the header for better accessibility.
  - **Empty States**: Friendly "No Events" illustration and call-to-action when the calendar is empty.
- **Responsive Design**: Improved layout for mobile devices, including optimized header and calendar grid.

## [1.3.0] - 2025-11-30

### Added

- **Time Standardization**: All times are now displayed in 24-hour format across the application.
- **Calendar Views**: Added Month, Week, and Day views for better event visualization.
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
