# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2025-12-03

### Added

- **Advanced Filtering**: Added "All Day" and "Recurring" filters to the list view.
- **Sort Toggle**: Added a button to toggle sort order (ascending/descending).
- **Filtered Export**: Export functionality now respects the currently active filters (search, date range, type).
- **Sticky Header**: Moved search bar and filters to the sticky header for better accessibility while scrolling.

### Fixed

- **Event Deletion**: Fixed an issue where deleting events with slashes in the UID failed.

### Changed

- **Data Cleanup**: Removed all untitled events from the database and updated import logic to automatically reject events without a title.
- **UI Simplification**: Removed the "No Title" filter as it is no longer needed.

## [2.2.2] - 2025-12-03

### Fixed

- **Security**: Mitigated log injection vulnerability by sanitizing `startDate` and `endDate` inputs in logs.
- **CLI**: Fixed `list` and `search` commands to correctly handle the new object return format from `CalendarManager`.
- **Data Integrity**: Fixed a critical bug in `updateEvent` where dates were not normalized and `raw_data` was not regenerated, leading to data corruption and export failures.
- **Export**: Updated `exportToICS` to gracefully handle JSON `raw_data` by falling back to event reconstruction, preventing export crashes.
- **Date Handling**: Fixed `isAllDay` detection logic and ensured `startDate`/`endDate` are always returned as standard ISO 8601 strings to the frontend.

### Changed

- **Refactoring**: Refactored `addEvent` and `updateEvent` to use a shared `_prepareEventData` method for consistent date normalization and `raw_data` generation.
- **Logging**: Removed noisy debug `console.log` statements from production code.

### Added

- **Tests**: Added comprehensive tests for:
  - Invalid date inputs in `addEvent`.
  - `/api/export` endpoint (end-to-end).
  - Pagination edge cases and error handling.
  - Server API contract verification (including `totalDatabaseCount`).

## [2.2.1] - 2025-12-03

### Fixed

- **Safari Compatibility**: Added `-webkit-backdrop-filter` vendor prefixes for Safari support to all glassmorphism UI elements:
  - Modal overlay backdrop blur effect
  - Empty state background blur effect
  - Settings panel backdrop blur effect

### Documentation

- **README.md**: Updated with information about browser compatibility improvements
- **architecture.md**: Added CSS vendor prefix information to the frontend section

## [2.2.0] - 2025-12-03

### Changed

- **Notification System**: Replaced toast notifications with a console-style error overlay system.
  - Success messages are now silent and only logged to the browser console (e.g., "Event added successfully").
  - Error messages display in a prominent console overlay with:
    - Timestamp in 24-hour format
    - Error type indicator (ERROR/INFO)
    - Detailed error information (JSON formatted for objects)
    - App-controlled dismiss button (no auto-hide)
  - Console overlay features:
    - Dark terminal theme (#1e1e1e background)
    - Monospace font for readability
    - Colour-coded messages (red for errors, blue for info)
    - Escape key support for quick dismissal
    - Click outside to close

### Removed

- **Toast Notifications**: Removed auto-dismissing toast notification system for a cleaner, less intrusive UX.

## [2.1.1] - 2025-12-03

### Fixed

- **Event Creation**: Fixed "Invalid Date Time" error when creating events via the web interface. The `ensureSeconds` helper function now properly converts `datetime-local` format (`YYYY-MM-DDTHH:mm`) to ISO 8601 format with seconds (`YYYY-MM-DDTHH:mm:ss`) as required by `ical.js`.
- **Date Storage**: Database now correctly stores parsed `ICAL.Time` objects as ISO strings instead of raw input, ensuring consistent date formatting throughout the application.

### Changed

- **Date Parsing**: Enhanced date parsing logic in `CalendarManager.addEvent()` with better error handling and validation.
- **Logging**: Added detailed console logging for date conversion debugging.

### Documentation

- **CLAUDE.md**: Added comprehensive documentation about date format conversion and the `ensureSeconds` helper function.
- **Common Pitfalls**: Updated to include date formatting requirements and database storage best practices.

## [2.1.0] - 2025-12-03

### Added

- **Infinite Scroll**: Replaced "Load More" button with automatic infinite scrolling for a seamless browsing experience.
- **Event Counts**: Added a display showing the number of events currently loaded vs. the total number of events in the database.
- **Pagination Metadata**: API now returns total event counts and pagination metadata.
- **Empty State**: Improved empty state UI to distinguish between an empty database and empty search results, showing the total database count when no items are found.

## [2.0.1] - 2025-12-03

### Fixed

- **Git Configuration**: Removed `calendar.db` from git tracking and added it to `.gitignore` to prevent repository bloat and push errors.
- **Delete Confirmation**: Fixed an issue where the delete confirmation popup would disappear immediately by replacing the native `confirm()` dialog with a custom, styled modal.

### Documentation

- **Architecture**: Updated `docs/architecture.md` to reflect the correct project structure.
- **README**: Added instructions for database setup and `agents.md` symlinking.

## [2.0.0] - 2025-12-03

### Added

- **SQLite Database**: Migrated data storage from flat `.ics` files to a SQLite database for improved performance and scalability.
- **Pagination**: Implemented pagination for API endpoints and Frontend to efficiently handle large datasets (100MB+).
- **Export Functionality**: Added ability to export the calendar database back to an `.ics` file via CLI and Web GUI.
- **CLI Import**: New `load` command in CLI to bulk import events from `.ics` files into the database.

### Changed

- **Architecture**: Refactored `CalendarManager` to interact with `lib/database.js` instead of direct file manipulation.
- **Performance**: Significant performance improvements for loading and searching events, especially with large files.
- **Dependencies**: Added `sqlite3` dependency. Removed `date-fns`.

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
