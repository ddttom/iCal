// Test suite for time conversion logic used in the frontend
// This verifies the UTC-in, UTC-out strategy for consistent time display

// --- Helper Functions (Same logic as in public/app.js) ---

function inputToUTC(localDateStr) {
    // User enters "2025-11-30T15:00" thinking it's 15:00.
    // We store it as 15:00 UTC by appending ":00Z".
    return new Date(localDateStr + ':00Z').toISOString();
}

function utcToDisplay(isoStr) {
    // Display "2025-11-30T15:00:00.000Z" as "15:00" regardless of browser timezone.
    const date = new Date(isoStr);
    return date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'UTC'
    });
}

function utcToGridPosition(isoStr) {
    // Calculate grid position using UTC hours/minutes
    const date = new Date(isoStr);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return (hours * 60) + minutes;
}

// --- Jest Tests ---

describe('Time Conversion Logic', () => {
    describe('inputToUTC', () => {
        it('should convert local input "15:00" to UTC ISO string', () => {
            const input = '2025-11-30T15:00';
            const expected = '2025-11-30T15:00:00.000Z';
            expect(inputToUTC(input)).toBe(expected);
        });

        it('should handle midnight correctly', () => {
            const input = '2025-11-30T00:00';
            const expected = '2025-11-30T00:00:00.000Z';
            expect(inputToUTC(input)).toBe(expected);
        });

        it('should handle late evening times', () => {
            const input = '2025-11-30T23:30';
            const expected = '2025-11-30T23:30:00.000Z';
            expect(inputToUTC(input)).toBe(expected);
        });
    });

    describe('utcToDisplay', () => {
        it('should display "15:00" for afternoon UTC time', () => {
            const utc = '2025-11-30T15:00:00.000Z';
            expect(utcToDisplay(utc)).toBe('15:00');
        });

        it('should display "00:00" for midnight UTC', () => {
            const utc = '2025-11-30T00:00:00.000Z';
            expect(utcToDisplay(utc)).toBe('00:00');
        });

        it('should display "03:00" for early morning UTC', () => {
            const utc = '2025-11-30T03:00:00.000Z';
            expect(utcToDisplay(utc)).toBe('03:00');
        });

        it('should display 24-hour format, not 12-hour', () => {
            const utc = '2025-11-30T13:00:00.000Z';
            expect(utcToDisplay(utc)).toBe('13:00');
        });
    });

    describe('utcToGridPosition', () => {
        it('should calculate position for 15:00 as 900 minutes', () => {
            const utc = '2025-11-30T15:00:00.000Z';
            expect(utcToGridPosition(utc)).toBe(900);
        });

        it('should calculate position for midnight as 0 minutes', () => {
            const utc = '2025-11-30T00:00:00.000Z';
            expect(utcToGridPosition(utc)).toBe(0);
        });

        it('should calculate position for 03:00 as 180 minutes', () => {
            const utc = '2025-11-30T03:00:00.000Z';
            expect(utcToGridPosition(utc)).toBe(180);
        });

        it('should handle times with minutes', () => {
            const utc = '2025-11-30T15:30:00.000Z';
            expect(utcToGridPosition(utc)).toBe(930); // 15*60 + 30
        });
    });

    describe('End-to-End Flow', () => {
        it('should preserve time through input -> storage -> display', () => {
            const input = '2025-11-30T15:00';
            const stored = inputToUTC(input);
            const displayed = utcToDisplay(stored);
            expect(displayed).toBe('15:00');
        });

        it('should position events correctly on the grid', () => {
            const input = '2025-11-30T15:00';
            const stored = inputToUTC(input);
            const position = utcToGridPosition(stored);
            expect(position).toBe(900); // 15:00 = 900 minutes from midnight
        });
    });
});
