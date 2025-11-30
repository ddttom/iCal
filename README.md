# iCal Manager

A Node.js application to manage iCal (.ics) files via CLI and a Web GUI.

## Features

- **CLI**: Load, list, search, add, update, and delete events from the command line.
- **Web GUI**: A modern web interface to manage your calendar events.
- **iCal Support**: Parses and generates standard iCal format using `ical.js`.

## Installation

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

## Usage

### CLI

The CLI tool is located at `index.js`.

**List Events:**

```bash
node index.js list -f calendar.ics
```

**Search Events:**

```bash
node index.js search "Meeting" -f calendar.ics
```

**Add Event:**

```bash
node index.js add -f calendar.ics
```

(Follow the interactive prompts)

**Delete Event:**

```bash
node index.js delete <UID> -f calendar.ics
```

### Web GUI

1. Start the server:

   ```bash
   node server.js
   ```

2. Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

The GUI allows you to view all events, search for specific events, add new ones, and delete existing ones.

## Project Structure

- `index.js`: CLI entry point.
- `server.js`: Express server for the Web GUI.
- `lib/`: Core logic and utilities.
- `public/`: Frontend assets (HTML, CSS, JS).
