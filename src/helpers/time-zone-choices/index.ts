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
  moment.tz.names().filter(x => {
    const notStartTz = startTimezones.indexOf(x) === -1;
    const isCommon = x.match(/^(((Africa|America|Antarctica|Asia|Australia|Europe|Arctic|Atlantic|Indian|Pacific)\/.+)|(UTC))$/);
    return notStartTz && isCommon;
  })
).map(zone => ({
  id: zone,
  label: zone,
}));

export default TIMEZONE_CHOICES;
