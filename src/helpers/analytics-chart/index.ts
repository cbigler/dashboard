import * as d3Array from 'd3-array';

import { AnalyticsFocusedMetric, AnalyticsDatapoint, QueryInterval } from "../../types/analytics";


export type ChartSegmentMultipleDays = {
  type: 'MULTIPLE_DAYS',
  days: string[],
  series: Array<{
    space_id: string,
    data: Array<{
      day: string,
      value: number,
    }>
  }>
}
export type ChartSegmentTimesOfSingleDay = {
  type: 'TIMES_OF_SINGLE_DAY',
  day: string,
  times: string[],
  series: Array<{
    space_id: string,
    data: Array<{
      time: string,
      value: number,
    }>
  }>
}
  
export type ChartSegment = ChartSegmentMultipleDays | ChartSegmentTimesOfSingleDay;

export type ChartData = {
  days: string[],
  minMetricValue: number,
  maxMetricValue: number,
  // Store which dates in the dataset are the start of a new year and month...
  // This will be used to label years/months
  // eg. if the first date in the dataset is 2019-03-12 then that date is added to both yearStartDates and monthStartDates
  //     then, if 2019-04-02 is the first date in April, then that date is added to monthStartDates
  yearStartDates: string[],
  monthStartDates: string[],
  segments: ChartSegment[],
}
  

export function computeChartData(
  datapoints: AnalyticsDatapoint[],
  interval: QueryInterval,
  selectedMetric: AnalyticsFocusedMetric,
  hiddenSpaceIds: string[],
): ChartData {

  const hiddenSpaceIdsSet = new Set(hiddenSpaceIds);
  
  const yearStartDatesMap = new Map<string, string>();
  const monthStartDatesMap = new Map<string, string>();

  const handleStartDates = (dateString: string) => {
    const [year, month,] = dateString.split('-');
    if (!yearStartDatesMap.has(year)) {
      yearStartDatesMap.set(year, dateString)
    }
    const monthKey = `${year}-${month}`
    if (!monthStartDatesMap.has(monthKey)) {
      monthStartDatesMap.set(monthKey, dateString)
    }
  }

  if (interval === QueryInterval.ONE_DAY) {
    const dataset = d3Array.rollup(
      datapoints,
      (v: AnalyticsDatapoint[]) => {
        switch (selectedMetric) {
          case AnalyticsFocusedMetric.MAX:
            return d3Array.max(v, d => d.max) || 0;
          case AnalyticsFocusedMetric.UTILIZATION:
            return d3Array.max(v, d => d.target_utilization) || 0;
          case AnalyticsFocusedMetric.OPPORTUNITY:
            return d3Array.min(v, d => d.opportunity) || 0;
          case AnalyticsFocusedMetric.ENTRANCES:
            return d3Array.sum(v, d => d.entrances) || 0;
          case AnalyticsFocusedMetric.EXITS:
            return d3Array.sum(v, d => d.exits) || 0;
          case AnalyticsFocusedMetric.EVENTS:
            return d3Array.sum(v, d => d.events) || 0;
          case AnalyticsFocusedMetric.VENT_CUBIC_FEET_PER_MINUTE:
            return (d3Array.max(v, d => d.max) || 0) * 40;
          case AnalyticsFocusedMetric.VENT_WATTS_PER_HOUR:
            return (d3Array.max(v, d => d.max) || 0) * 40 * 0.58;
          case AnalyticsFocusedMetric.VENT_ENERGY_MONTHLY_COST:
            return (d3Array.max(v, d => d.max) || 0) * 40 * 0.58 * .1279 * 24 * 30 / 1000;
          default:
            throw new Error('Nope')
        }
      },
      (d: AnalyticsDatapoint) => d.space_id,
      // @ts-ignore
      (d: AnalyticsDatapoint) => d.localBucketDay,
    )

    const series: ChartSegmentMultipleDays['series'] = [];
    const localBucketDaysWithData = new Set<string>();
    let maxMetricValue = 0;
    let minMetricValue = 0;
    dataset.forEach((dayValues: Map<string, number>, space_id: string) => {
      if (hiddenSpaceIdsSet.has(space_id)) return;
      const data: ChartSegmentMultipleDays['series'][number]['data'] = [];
      dayValues.forEach((value: number, dateString: string) => {
        
        minMetricValue = value < minMetricValue ? value : minMetricValue;
        maxMetricValue = value > maxMetricValue ? value : maxMetricValue;
        localBucketDaysWithData.add(dateString);
        handleStartDates(dateString);
        
        data.push({
          day: dateString,
          value,
        })
      })
      series.push({
        space_id,
        data,
      })
    })
    const days = Array.from(localBucketDaysWithData);

    return {
      days,
      segments: [{
        type: 'MULTIPLE_DAYS',
        days,
        series,
      }],
      minMetricValue,
      maxMetricValue,
      yearStartDates: Array.from(yearStartDatesMap.values()),
      monthStartDates: Array.from(monthStartDatesMap.values()),
    }


  } else { // interval is NOT 1-day
    const dataset = d3Array.rollup(
      datapoints,
      (v: AnalyticsDatapoint[]) => {
        switch (selectedMetric) {
          case AnalyticsFocusedMetric.MAX:
            return d3Array.max(v, d => d.max) || 0;
          case AnalyticsFocusedMetric.UTILIZATION:
            return d3Array.max(v, d => d.target_utilization) || 0;
          case AnalyticsFocusedMetric.OPPORTUNITY:
            return d3Array.min(v, d => d.opportunity) || 0;
          case AnalyticsFocusedMetric.ENTRANCES:
            return d3Array.sum(v, d => d.entrances) || 0;
          case AnalyticsFocusedMetric.EXITS:
            return d3Array.sum(v, d => d.exits) || 0;
          case AnalyticsFocusedMetric.EVENTS:
            return d3Array.sum(v, d => d.events) || 0;
          default:
            throw new Error('Nope')
        }
      },
      (d: AnalyticsDatapoint) => d.localBucketDay,
      // @ts-ignore
      (d: AnalyticsDatapoint) => d.space_id,
      (d: AnalyticsDatapoint) => d.localBucketTime,
    )

    const days: string[] = [];
    const segments: ChartSegmentTimesOfSingleDay[] = [];
    let minMetricValue = 0;
    let maxMetricValue = 0;
    dataset.forEach((dayBreakdown: Map<string, Map<string, number>>, localBucketDay: string) => {
      days.push(localBucketDay);
      handleStartDates(localBucketDay);
      const dayTimesUsed = new Set<string>();
      const series: ChartSegmentTimesOfSingleDay['series'] = [];
      dayBreakdown.forEach((spaceBreakdown: Map<string, number>, space_id: string) => {
        if (hiddenSpaceIdsSet.has(space_id)) return;
        const data: ChartSegmentTimesOfSingleDay['series'][number]['data'] = [];
        spaceBreakdown.forEach((value: number, localBucketTime: string) => {
          minMetricValue = value < minMetricValue ? value : minMetricValue;
          maxMetricValue = value > maxMetricValue ? value : maxMetricValue;
          dayTimesUsed.add(localBucketTime);
          
          data.push({
            time: localBucketTime,
            value,
          })
        })
        series.push({
          space_id,
          data,
        })
      })

      const times = Array.from(dayTimesUsed).sort();

      segments.push({
        type: 'TIMES_OF_SINGLE_DAY',
        day: localBucketDay,
        times,
        series,
      })
    })
    return {
      days,
      segments,
      minMetricValue,
      maxMetricValue,
      yearStartDates: Array.from(yearStartDatesMap.values()),
      monthStartDates: Array.from(monthStartDatesMap.values()),
    };

  }
}
