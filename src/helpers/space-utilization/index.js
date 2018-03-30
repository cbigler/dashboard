import moment from 'moment';
import 'moment-timezone'; 

export const TIME_SEGMENTS = {
  WHOLE_DAY: {start: 0, end: 24, name: 'Whole Day', phrasal: 'whole day'},
  WORKING_HOURS: {start: 8, end: 18, name: 'Open Hours', phrasal: 'open hours'},

  MORNING: {start: 8, end: 12, name: 'Morning', phrasal: 'the morning'},
  BREAKFAST: {start: 8, end: 10, name: 'Breakfast', phrasal: 'breakfast'},
  LUNCH: {start: 11, end: 14, name: 'Lunch', phrasal: 'lunch'},
  AFTERNOON: {start: 12, end: 18, name: 'Afternoon', phrasal: 'the afternoon'},
};

export function groupCountsByDay(counts, timezone) {
  // Group counts into buckets, grouping by day.
  // ie, dayCountGroups = {'2018-05-01': [a, b, ...], '2018-05-02': [x, y, z, ...]}
  const dayCountGroups = counts.reduce((groups, i) => {
    const day = moment.utc(i.timestamp).tz(timezone).format('YYYY-MM-DD');
    return {
      ...groups,
      [day]: [...(groups[day] || []), i],
    };
  }, {});

  return Object.keys(dayCountGroups).map(group => {
    return {
      date: group,
      totalVisits: dayCountGroups[group].reduce((acc, i) => {
        return acc + i.interval.analytics.entrances;
      }, 0),
      counts: dayCountGroups[group],
    };
  });
}

export function groupCountFilter(groups, predicate) {
  return groups.map(group => {
    return {
      ...group,
      counts: group.counts.filter(predicate),
    };
  });
}

export function isWithinTimeSegment(timestamp, timezone, segment) {
  const t = timestamp instanceof moment ? timestamp : moment.utc(timestamp).tz(timezone);
  const weekday = t.isoWeekday();
  const hour = t.get('hour');
  const result = (
    weekday <= 5 && // Monday - Friday
    hour > segment.start && hour < segment.end // 9am <= hour <= 5pm
  );
  return result;
}

export default function spaceUtilizationPerGroup(space, groups) {
  if (space.capacity == null) {
    throw new Error('Utilization cannot be calculated without a capacity.');
  }

  return groups.map(i => {
    if (i.counts.length === 0) {
      return {date: i.date, utilization: [], averageUtilization: 0};
    }

    // For each count within the group, calculate the count over the capacity, also referred to as
    // utilization.
    const utilization = i.counts.map(j => j.count / space.capacity);

    // Then, calculate the average utilization value for the whole group.
    const averageUtilization = utilization.reduce((a, b) => a + b) / utilization.length;

    return {date: i.date, utilization, averageUtilization};
  });
}
