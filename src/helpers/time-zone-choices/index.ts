import moment from 'moment';

// Sort these timezones at the start of the list as they are the more common ones that people are
// likely to use.
export const startTimezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
];

const TIMEZONE_CHOICES = startTimezones.concat(
  moment.tz.names().filter(x => startTimezones.indexOf(x) === -1)
).map(zone => ({
  id: zone,
  label: zone.replace(/_/g, ' ').replace(/\//g, ' - '),
}));

export default TIMEZONE_CHOICES;
