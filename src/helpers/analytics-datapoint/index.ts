import moment from 'moment';

import { DensitySpaceCountBucket, DensitySpace } from '../../types'
import { AnalyticsDatapoint } from '../../types/analytics';


const toLocalEpochTime = (timestamp: string, timeZone: string): number => {
  const d = moment.tz(new Date(timestamp), timeZone);
  return d.add(d.utcOffset(), 'minutes').valueOf()
}

export function createDatapoint(countDatum: DensitySpaceCountBucket, space: DensitySpace): AnalyticsDatapoint {

  const startActualEpochTime = Date.parse(countDatum.interval.start)
  const endActualEpochTime = Date.parse(countDatum.interval.end)
  const startLocalEpochTime = toLocalEpochTime(countDatum.interval.start, space.timeZone);
  const endLocalEpochTime = toLocalEpochTime(countDatum.interval.end, space.timeZone);

  return {
    startActualEpochTime,
    endActualEpochTime,
    startLocalEpochTime,
    endLocalEpochTime,
    spaceId: space.id,
    spaceName: space.name,
    count: countDatum.count,
    utilization: countDatum.interval.analytics.utilization,
    events: countDatum.interval.analytics.events,
    entrances: countDatum.interval.analytics.entrances,
    exits: countDatum.interval.analytics.exits,
    min: countDatum.interval.analytics.min,
    max: countDatum.interval.analytics.max,
  }
}
