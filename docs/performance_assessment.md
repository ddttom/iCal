# Performance Assessment: 110MB iCal File

## Executive Summary

**The application will likely NOT cope well with a 110MB iCal file in its current state.**

A 110MB `.ics` file typically contains tens of thousands of events. The current architecture loads, parses, and renders all data synchronously and in-memory. This will lead to:

1. **Server Freezes:** Requests will take seconds or tens of seconds to process.
2. **High Memory Usage:** Potential crashes due to Node.js heap limits.
3. **Browser Crashes:** The frontend attempts to render all events at once, which will freeze or crash the user's browser.

## Detailed Bottlenecks

### 1. Server-Side: Synchronous I/O and Parsing

**Location:** `server.js` and `lib/calendar.js`

- **The Issue:** The `CalendarManager.load()` method uses `fs.readFileSync` to read the file and `ICAL.parse()` to parse it.
- **Impact:**
  - `server.js` calls `load()` on **every** request to `/api/events` (line 30).
  - Parsing 110MB of text into a JavaScript object tree is extremely CPU-intensive.
  - Since Node.js is single-threaded, the entire server will **block** (freeze) while parsing. No other requests can be handled during this time.

### 2. Memory Consumption

**Location:** `lib/calendar.js`

- **The Issue:** The entire file content is loaded into a string, then parsed into a generic JSON structure (jCal), and then wrapped in `ICAL.Component` objects.
- **Impact:** A 110MB text file can easily expand to **500MB - 1GB** of memory usage when fully parsed into objects. This puts the application at risk of hitting the default Node.js memory limit (usually around 1.5GB) and crashing with an "Out of Memory" error.

### 3. Frontend: No Pagination

**Location:** `public/app.js`

- **The Issue:** The `/api/events` endpoint returns **all** events in a single JSON response. The frontend `renderEvents` function loops through this array and creates DOM elements for every single event.
- **Impact:**
  - **Network:** Downloading a JSON response representing 110MB of iCal data (which is verbose) will be slow.
  - **Rendering:** Creating tens of thousands of DOM nodes (`div.event-card`) will freeze the browser tab. Most browsers struggle with more than a few thousand complex DOM elements.

## Recommendations

To support a file of this size, the architecture needs significant changes:

### Short-Term Fixes (Mitigation)

1. **Cache Data:** Do not call `load()` on every request. Load the data once at startup and only reload if the file changes (using `fs.watch`) or after a write operation.
2. **Pagination:** Update the API to accept `page` and `limit` parameters. Only return 50-100 events at a time to the frontend.
3. **Date Range Filtering:** Force the frontend to request events only for the current month/view, rather than fetching everything.

### Long-Term Solutions (Architecture Change)

1. **Database:** Move away from direct file manipulation for runtime operations. Import the `.ics` file into a database (SQLite, MongoDB, or PostgreSQL).
    - Use the database for querying, filtering, and pagination.
    - Only generate the `.ics` file when the user explicitly requests an "Export".
2. **Streaming Parser:** If keeping the file-based approach is mandatory, use a streaming iCal parser to process the file line-by-line instead of loading it all into memory.

## Conclusion

Attempting to run the current app with a 110MB file is **not recommended** and will likely result in a poor or unusable experience.
