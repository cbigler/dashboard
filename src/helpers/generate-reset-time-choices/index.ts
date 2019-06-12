import {
  getCurrentLocalTimeAtSpace,
  prettyPrintHoursMinutes,
} from '../space-time-utilities/index';

// Generate reset time options
export default function generateResetTimeChoices(space) {
  return [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map(hour => {
    const time = getCurrentLocalTimeAtSpace(space).startOf('day').add(hour, 'hour');
    return {
      value: time.format('HH:mm'),
      display: prettyPrintHoursMinutes(time),
      hourOnlyDisplay: time.format('ha').slice(0, -1),
    };
  });
}
