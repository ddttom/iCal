# Architecture Documentation

## Overview

The iCal Manager is a Node.js-based application designed to manage iCal (.ics) files. It provides two primary interfaces:

1. **Command Line Interface (CLI):** For quick, scriptable management of calendar events.
2. **Web Graphical User Interface (GUI):** For a visual, interactive experience with list and calendar views.

The application is built around a shared core library that handles the parsing and manipulation of iCal data using `ical.js`.

## Project Structure

```text
.
├── index.js                # Entry point for the CLI
├── server.js               # Entry point for the Web Server
├── lib/                    # Core logic and utilities
│   ├── calendar.js         # CalendarManager class (Business Logic)
│   ├── database.js         # Database abstraction layer (SQLite)
│   └── utils.js            # File I/O utilities
├── public/                 # Frontend assets
│   ├── index.html          # Main HTML file
│   ├── app.js              # Frontend logic
│   ├── style.css           # Global styles
│   └── lib/                # Frontend dependencies
├── test/                   # Unit and integration tests
├── calendar.db             # SQLite database file (ignored by git)
├── agents.md               # Agentic workflow context (optional)
└── package.json            # Project configuration and dependencies
```

## Key Components

### 1. Database Layer (`lib/database.js`)

The `Database` class handles all interactions with the SQLite database.

- **Responsibilities:**
  - Initializing the database and creating tables.
  - Executing SQL queries for CRUD operations.
  - Managing database connections.

### 2. Core Logic (`lib/calendar.js`)

The `CalendarManager` class orchestrates the application logic, bridging the gap between the API/CLI and the database.

- **Responsibilities:**
  - Importing and parsing `.ics` files (using `ical.js`) into the database.
  - Exporting database records to `.ics` format.
  - Calling `Database` methods for event management.
  - Data transformation: Converts database rows into JSON objects for consumers.
  - Date format conversion: The `ensureSeconds` helper function ensures dates are in proper ISO 8601 format with seconds (`YYYY-MM-DDTHH:mm:ss`) as required by `ical.js`.

### 3. Command Line Interface (`index.js`)

The CLI provides a way to interact with the application from the terminal.

- **Libraries:** `commander` (argument parsing), `inquirer` (interactive prompts).
- **Commands:**
  - `load <file>`: Import an iCal file into the database.
  - `export <file>`: Export the database to an iCal file.
  - `list`: List events (paginated).
  - `search <query>`: Search for events.
  - `add`: Interactive wizard to add an event.
  - `delete <uid>`: Delete an event by its UID.

### 4. Web Server (`server.js`)

The web server exposes the core logic via a RESTful API and serves the frontend assets.

- **Framework:** `express`.
- **API Endpoints:**
  - `GET /api/events`: Retrieve events (paginated).
  - `GET /api/events/search`: Search events by query or date range (paginated).
  - `POST /api/events`: Create a new event.
  - `PUT /api/events/:uid`: Update an existing event.
  - `DELETE /api/events/:uid`: Delete an event.
  - `GET /api/export`: Download the calendar as `.ics`.
- **Data Persistence:** SQLite database (`calendar.db` by default).

### 5. Frontend (`public/`)

The frontend is a Single Page Application (SPA) built with Vanilla JavaScript.

- **`index.html`:** Defines the structure, including the list view, calendar view container, and modals.
- **`app.js`:** Handles:
  - Fetching data from the API (supports pagination).
  - Rendering the Event List and **Infinite Scroll** functionality (using `IntersectionObserver`).
  - Rendering the Calendar View (using `jcalendar.js`).
  - Managing UI state (Modals including Delete Confirmation, Tabs, Theme, Time Format).
  - Form submissions (Add/Edit/Import).
- **`style.css`:** Custom CSS variables and styles for a modern, responsive UI.

## Data Flow

### CLI Flow (Import)

1. User executes `node index.js load file.ics`.
2. `CalendarManager` reads the file.
3. `ical.js` parses the content.
4. `CalendarManager` iterates through events and inserts them into the SQLite database via `Database` class.

### Web Flow (View Events)

1. User opens the web app.
2. `app.js` requests `/api/events?page=1&limit=100`.
3. `server.js` calls `CalendarManager.listEvents()`.
4. `CalendarManager` queries the `Database`.
5. `Database` executes `SELECT * FROM events LIMIT 100 OFFSET 0` and `SELECT COUNT(*)`.
6. Results are returned as JSON `{ events, total, totalDatabaseCount, page, limit }` to the frontend.

## Date Handling

The application uses a standardised approach to date handling:

### Format Requirements

- **`ical.js` Requirement:** All dates must be in ISO 8601 format with seconds (`YYYY-MM-DDTHH:mm:ss`).
- **Frontend Input:** HTML `datetime-local` inputs provide dates without seconds (`YYYY-MM-DDTHH:mm`).
- **Conversion:** The `ensureSeconds` helper function in `CalendarManager.addEvent()` handles the conversion:
  - Detects 16-character datetime-local format
  - Appends `:00` for seconds
  - Handles JavaScript Date objects via `.toISOString()`
  - Validates and passes through existing ISO 8601 strings

### Storage

- **Database:** Stores dates as ISO 8601 strings (output from `ICAL.Time.toString()`)
- **Backend:** Uses `ICAL.Time` objects for date manipulation
- **Frontend:** Displays dates using browser locale with 24-hour format

### Example Flow

1. User enters: `2025-12-05T14:30` (datetime-local)
2. `ensureSeconds()` converts to: `2025-12-05T14:30:00`
3. `ICAL.Time.fromString()` parses the date
4. `event.startDate.toString()` produces: `2025-12-05T14:30:00` (stored in database)

## Dependencies

- **`sqlite3`:** SQLite client for Node.js.
- **`ical.js`:** The core parser for iCalendar data.
- **`express`:** Web server framework.
- **`commander`:** CLI framework.
- **`inquirer`:** Interactive CLI prompts.
- **`jcalendar.js`:** Frontend library for rendering the monthly calendar view.
- **`uuid`:** Generates unique identifiers for events.
