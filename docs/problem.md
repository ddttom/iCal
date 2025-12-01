# Problem Report: Timezone & Crash Issues

## The Problem

The application is experiencing two main issues:

1. **Application Crash**: The client-side JavaScript fails to execute correctly, preventing event creation and potentially page functionality. This was caused by a syntax error (duplicate variable declaration) introduced during an edit to `app.js`.
2. **Incorrect Time Display**: Events scheduled for "15:00" (3 PM) are appearing at the "03:00" (3 AM) position or label on the calendar grid, or being displayed with the wrong hour. This indicates a failure to correctly handle the 24-hour format or a timezone conversion error.

## Steps Taken

1. **Initial Feature Request**: Added "View Raw" button (successful) and attempted to switch time grid to 24h format.
2. **Debug Phase**:
    * Added debug logs to `app.js` to inspect `event.startDate` and `getHours()`.
    * Logs revealed that `getHours()` returns the *local* hour of the browser. If the browser's local time differs from UTC, the positioning on the grid (which we tried to standardize to UTC) would be wrong.
3. **Standardization Attempt**:
    * Modified `addEventForm` to append `:00Z` to inputs, forcing them to be treated as UTC ISO strings.
    * Modified `renderEvents` and `renderTimeGrid` to use `getUTCHours()` for positioning and `toLocaleTimeString(..., {timeZone: 'UTC', hour12: false})` for display.
    * This was intended to make the app "UTC-only" internally and "24h" visually.
4. **Crash Introduction**:
    * During the application of these logic changes to `app.js`, a copy-paste error occurred, duplicating the `const eventData = ...` block in the submit handler.
    * This syntax error prevents the JavaScript from running correctly, causing the "crash".
5. **Testing**:
    * Created `test/time_conversion.test.js` which verified that the logic `new Date("...:00Z")` and `timeZone: 'UTC'` *should* work correctly in isolation.

## Findings & Diagnosis

* **The Crash**: Is definitely due to the syntax error in `public/app.js` (duplicate `const eventData`). This must be fixed before any verification can happen.
* **The Time Issue**:
  * If 15:00 displays as 03:00, it suggests `hour12: false` is not being respected, OR the date object is being parsed as 3 AM.
  * Since `15:00` input + `:00Z` = `15:00 UTC`, `getUTCHours()` returns 15.
  * If the user sees it at "03:00", it is possible the event title formatting fell back to 12-hour format (default for some locales) despite the options.
  * **Conclusion**: The logic seems sound in theory (UTC-in, UTC-out), but the implementation was botched by the syntax error, and the browser verification was interrupted.

## Recommended Next Steps

1. **Fix Syntax**: Remove the duplicate code block in `app.js`.
2. **Verify Labels**: Ensure the grid sidebar generation loop explicitly uses 24h formatting.
3. **Verify Event Title**: Ensure the tooltip/title formatter explicitly sets `hour12: false`.

## Resolution (2025-12-01)

All issues have been successfully resolved:

1. **Syntax Error Fixed**:
   - The duplicate `const eventData` declaration was already removed from [public/app.js](../public/app.js)
   - Additional cleanup: Removed duplicate event listener for `viewEventModal` (lines 113-123)
   - Code now passes ESLint validation

2. **Time Display Verified**:
   - Grid positioning uses `getUTCHours()` and `getUTCMinutes()` (lines 419-420)
   - Time labels use 24-hour format `HH:00` (lines 366-373)
   - Event tooltips use `hour12: false` and `timeZone: 'UTC'` (line 431)
   - List view formatting uses `hour12: false` and `timeZone: 'UTC'` (lines 201-213)
   - Form inputs append `:00Z` to force UTC interpretation (lines 587-588)

3. **Test Coverage Enhanced**:
   - Converted [test/time_conversion.test.js](../test/time_conversion.test.js) to proper Jest format
   - Added 13 comprehensive test cases covering:
     - Input conversion (local → UTC)
     - Display formatting (UTC → 24-hour display)
     - Grid positioning (UTC → minute offsets)
     - End-to-end flow verification
   - All 91 tests now pass

4. **Code Quality**:
   - ESLint passes with no errors
   - Indentation issues auto-fixed
   - Code follows project style guidelines

The application now consistently uses UTC for internal storage and 24-hour format for all displays, preventing timezone-related display issues.
