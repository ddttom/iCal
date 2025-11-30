const assert = require('assert');

// Mock browser behavior for testing
const mockLocalTimezoneOffset = -300; // EST (UTC-5) for example, or 0 for UTC
// We can't easily mock the system timezone in Node without libraries, 
// so we will test the logic we intend to use: 
// 1. Input: treating "YYYY-MM-DDTHH:mm" as UTC by appending "Z"
// 2. Display: using toLocaleString with timeZone: 'UTC'

console.log('Running Time Conversion Tests...');

// --- Logic to be tested ---

function inputToUTC(localDateStr) {
    // Intended logic: User enters "2025-11-30T15:00" thinking it's 15:00.
    // We want to store it as 15:00 UTC.
    // So we append ":00Z" to make it "2025-11-30T15:00:00Z".
    return new Date(localDateStr + ':00Z').toISOString();
}

function utcToDisplay(isoStr) {
    // Intended logic: We have "2025-11-30T15:00:00.000Z".
    // We want to display "15:00" regardless of browser timezone.
    // So we use timeZone: 'UTC'.
    const date = new Date(isoStr);
    return date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false, 
        timeZone: 'UTC' 
    });
}

function utcToGridPosition(isoStr) {
    // Intended logic: We have "2025-11-30T15:00:00.000Z".
    // We want the position for 15:00.
    const date = new Date(isoStr);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return (hours * 60) + minutes;
}

// --- Tests ---

try {
    // Test 1: Input "15:00" -> UTC Storage
    const input = "2025-11-30T15:00";
    const expectedUTC = "2025-11-30T15:00:00.000Z";
    const actualUTC = inputToUTC(input);
    assert.strictEqual(actualUTC, expectedUTC, `Test 1 Failed: Expected ${expectedUTC}, got ${actualUTC}`);
    console.log('Test 1 Passed: Input -> UTC');

    // Test 2: UTC Storage -> Display "15:00"
    const storedUTC = "2025-11-30T15:00:00.000Z";
    const expectedDisplay = "15:00";
    const actualDisplay = utcToDisplay(storedUTC);
    assert.strictEqual(actualDisplay, expectedDisplay, `Test 2 Failed: Expected ${expectedDisplay}, got ${actualDisplay}`);
    console.log('Test 2 Passed: UTC -> Display');

    // Test 3: UTC Storage -> Grid Position (15:00 = 900 minutes)
    const expectedMinutes = 15 * 60; // 900
    const actualMinutes = utcToGridPosition(storedUTC);
    assert.strictEqual(actualMinutes, expectedMinutes, `Test 3 Failed: Expected ${expectedMinutes}, got ${actualMinutes}`);
    console.log('Test 3 Passed: UTC -> Grid Position');

    // Test 4: Midnight Edge Case
    const inputMidnight = "2025-11-30T00:00";
    const utcMidnight = inputToUTC(inputMidnight);
    assert.strictEqual(utcMidnight, "2025-11-30T00:00:00.000Z", "Test 4 Failed: Midnight UTC");
    assert.strictEqual(utcToDisplay(utcMidnight), "00:00", "Test 4 Failed: Midnight Display");
    assert.strictEqual(utcToGridPosition(utcMidnight), 0, "Test 4 Failed: Midnight Position");
    console.log('Test 4 Passed: Midnight Edge Case');

    console.log('All tests passed!');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
