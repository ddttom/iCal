# iCal Manager

[![CI Status](https://github.com/ddttom/iCal/workflows/CI/badge.svg)](https://github.com/ddttom/iCal/actions)
[![codecov](https://codecov.io/gh/ddttom/iCal/branch/main/graph/badge.svg)](https://codecov.io/gh/ddttom/iCal)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](package.json)

A Node.js application to manage iCal (.ics) files via CLI and a Web GUI.

## Features

- **CLI**: Load, list, search, add, update, and delete events from the command line.
- **Web GUI**: A premium, modern web interface with:
  - **Dynamic UI**: Glassmorphism design, smooth animations, and responsive layout.
  - **Dark Mode**: Built-in dark theme support with a toggle switch for comfortable viewing in low-light environments.
  - **Interactive Elements**: Floating Action Button (FAB) and Header Buttons for quick event creation, modal forms for adding/editing events, and toast notifications.
  - **Real-time Search & Filtering**: Instant text search and date range filtering.
  - **Event Management**: View details, edit existing events, and delete events directly from the UI.
  - **Raw Data Inspection**: View the underlying iCal data for any event using the "View Raw" feature.
  - **Standardized Time**: All times are displayed in 24-hour format, with internal UTC storage for consistency.
  - **Visual Indicators**: Icons to easily distinguish between recurring and single events.
- **Advanced Calendar Features**:
  - **Repeating Events**: Support for recurring events (Daily, Weekly, Monthly) via `RRULE`.
  - **Advanced Properties**: Support for Attendees, Organizers, Status, Categories, and Alarms (VALARM).
  - **iCal Support**: Full parsing and generation of standard iCal format using `ical.js`.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [CLI](#cli)
  - [Web GUI](#web-gui)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [Community](#community)
- [Security](#security)
- [License](#license)
- [Support](#support)
- [Known Issues](#known-issues)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher

Check your versions:

```bash
node --version
npm --version
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ddttom/iCal.git
   cd iCal
   ```

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

### Filtering Events

The Web GUI provides powerful filtering capabilities to help you find specific events:

1. **Text Search**: Use the search bar at the top to filter events by:
    - **Summary** (e.g., "Meeting", "Lunch")
    - **Description** (e.g., specific details in the event body)
    - **Location** (e.g., "Conference Room")

2. **Date Filtering**: Use the date pickers next to the search bar:
    - **Start Date**: Show events that end after this date.
    - **End Date**: Show events that start before this date.
    - **Date Range**: Set both start and end dates to find events within a specific period.

## Project Structure

```text
iCal/
├── index.js           # CLI entry point
├── server.js          # Express server for Web GUI
├── lib/               # Core logic
│   ├── calendar.js    # CalendarManager class
│   └── utils.js       # Utility functions
├── public/            # Frontend assets (HTML, CSS, JS)
├── test/              # Test files
│   ├── calendar.test.js
│   ├── server.test.js
│   ├── utils.test.js
│   └── fixtures/      # Test fixtures
├── .github/           # GitHub configuration
│   ├── workflows/     # CI/CD workflows
│   └── ISSUE_TEMPLATE/ # Issue templates
├── package.json       # Project configuration
├── .markdownlint.json # Markdown linting configuration
└── README.md          # This file
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Check for linting errors
npm run lint

# Automatically fix linting errors
npm run lint:fix
```

### Scripts

- `npm start` - Start the web server
- `npm test` - Run test suite
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Our development workflow and branch naming conventions
- Code style guidelines
- Testing requirements
- Pull request process

Before contributing, please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## Community

- **[GitHub Discussions](https://github.com/ddttom/iCal/discussions)** - Ask questions, share ideas
- **[GitHub Wiki](https://github.com/ddttom/iCal/wiki)** - Extended documentation
- **[GitHub Projects](https://github.com/ddttom/iCal/projects)** - Project roadmap

## Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md). Do not open public issues for security concerns.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [Report bugs or request features](https://github.com/ddttom/iCal/issues)
- **Discussions**: [Ask questions or discuss ideas](https://github.com/ddttom/iCal/discussions)
- **Wiki**: [Read extended documentation](https://github.com/ddttom/iCal/wiki)

## Known Issues

For a list of currently known issues and troubleshooting steps, please refer to [docs/problem.md](docs/problem.md).

---

Made with ❤️ by the iCal Manager community
