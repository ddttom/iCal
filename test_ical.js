const ICAL = require('ical.js');

try {
    console.log('Testing new ICAL.Recur(\'FREQ=WEEKLY;BYDAY=MO\')...');
    const recur = new ICAL.Recur('FREQ=WEEKLY;BYDAY=MO');
    console.log('Success:', recur.toString());
} catch (e) {
    console.error('Error with constructor:', e.message);
}

try {
    console.log('Testing ICAL.Recur.fromString(\'FREQ=WEEKLY;BYDAY=MO\')...');
    const recur = ICAL.Recur.fromString('FREQ=WEEKLY;BYDAY=MO');
    console.log('Success:', recur.toString());
} catch (e) {
    console.error('Error with fromString:', e.message);
}
