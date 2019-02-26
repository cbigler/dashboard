import moment from 'moment';

// Sort these timezones at the start of the list as they are the more common ones that people are
// likely to use.
const startTimezones = [
  'America/New_York',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
];
const TIMEZONE_CHOICES: Array<{id: string, label: string}> = moment.tz.names().sort((a, b) => {
  // modified from https://stackoverflow.com/a/23921775/4115328
  if (startTimezones.includes(a)) {
    return -1;
  } else if (startTimezones.includes(b)) {
    return 1;
  } else {
    return 0;
  }
}).map(zone => ({
  id: zone,
  label: zone.replace(/_/g, ' ').replace(/\//g, ' - '),
}));

export default TIMEZONE_CHOICES;
