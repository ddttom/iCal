# Current Problem: Event Creation Failure

## Issue Description

Users are unable to create new events. The application displays an "Invalid Date Time" error (previously via alert, now intended via error overlay), and the "Add Event" modal fails to close.

## Symptoms

1. **"Invalid Date Time" Error**: The user reported seeing this specific error message. This message originates from the `lib/calendar.js` file, specifically within the `try...catch` block wrapping date parsing.
2. **Modal Stuck Open**: After clicking "Create Event", the modal remains visible, indicating that the frontend's success handler (`closeModal()`) is not being reached.
3. **Silent Failure (Potential)**: In recent verification attempts, the browser subagent reported that the modal stayed open but no error overlay appeared. This suggests the error might be getting caught but not correctly displayed, or the UI is not updating as expected.

## Technical Context

### Backend (`lib/calendar.js`)

- **Date Parsing**: The error "Invalid Date Time" is thrown when `ICAL.Time.fromString()` fails.
- **Input Format**: The frontend sends dates as `YYYY-MM-DDTHH:mm` (from `<input type="datetime-local">`).
- **Fix Attempted**: A helper function `ensureSeconds` was added to append `:00` to the date string if seconds are missing, as `ical.js` is strict about ISO 8601 format.
- **Logging**: Detailed `console.log` statements were added to trace the exact string values being passed to `ICAL.Time.fromString()`.

### Frontend (`public/app.js`)

- **Error Handling**: The `alert()` calls were replaced with a custom `showError()` function that toggles an `#errorOverlay`.
- **Request Payload**: The form data includes `summary`, `startDate`, `endDate`, and `rrule`.

### Tests

- **Unit Tests**: `test/calendar.test.js` was updated and passes locally. It verifies that `addEvent` correctly handles string inputs and Date objects.
- **Integration Tests**: `test/server.test.js` passes, confirming the API endpoint works in isolation with test data.

## Hypotheses

1. **Data Mismatch**: There might be a discrepancy between what the test environment sends (which works) and what the actual browser frontend sends. The browser might be sending an empty string or `null` for `endDate` in a way that `ensureSeconds` doesn't handle correctly (e.g., `undefined` vs `null` vs `""`).
2. **Recurrence Rule Interaction**: The error might be triggered when `rrule` is present. Although the error says "Date Time", if `ical.js` tries to expand the recurrence using an invalid start/end date, it could throw.
3. **Server State**: The server might need a restart to pick up the latest changes to `server.js` or `lib/calendar.js` if it wasn't successfully restarted in the last step.

## Next Steps

1. **Verify Logs**: Check the server logs (after a fresh restart) to see the *exact* payload receiving from the browser.
2. **Inspect Payload**: Use the browser network tab (via subagent or manual check) to see the request body.
3. **Validate `ensureSeconds`**: Ensure it handles all edge cases (empty string, null, undefined) robustly.
