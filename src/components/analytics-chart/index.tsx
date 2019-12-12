import React, { useRef } from 'react';
import styles from './styles.module.scss';
import moment from 'moment-timezone';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';

import { QueryInterval, AnalyticsFocusedMetric, AnalyticsDatapoint, AnalyticsReport, ResourceStatus } from '../../types/analytics';
import colorScale from '../../helpers/analytics-color-scale';
import useContainerWidth from '../../helpers/use-container-width';
import AnalyticsLoadingBar from '../analytics-loading-bar';
import AnalyticsLineChartTooltip from '../analytics-line-chart-tooltip';
import { DensitySpace } from '../../types';

import analyticsIntroImage from '../../assets/images/analytics-intro.svg';


type ChartSegmentMultipleDays = {
  type: 'MULTIPLE_DAYS',
  days: string[],
  series: Array<{
    spaceId: string,
    data: Array<{
      day: string,
      value: number,
    }>
  }>
}
type ChartSegmentTimesOfSingleDay = {
  type: 'TIMES_OF_SINGLE_DAY',
  day: string,
  times: string[],
  series: Array<{
    spaceId: string,
    data: Array<{
      time: string,
      value: number,
    }>
  }>
}

type ChartSegment = ChartSegmentMultipleDays | ChartSegmentTimesOfSingleDay;

type ChartData = {
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

function formatLocalBucketTimeLabel(localBucketTime: string, truncateMinutes: boolean = true) {
  const [hourString, minuteString] = localBucketTime.split(':');
  
  const hour = Number(hourString) % 24;
  const minute = minuteString === '00' && truncateMinutes ? '' : `:${minuteString}`;

  if (hour === 0) return `12${minute}a`
  if (hour === 12) return `12${minute}p`;
  if (hour > 12) return `${hour % 12}${minute}p`;
  return `${hour}${minute}a`;
}


function computeChartData(
  data: AnalyticsDatapoint[],
  interval: QueryInterval,
  selectedMetric: AnalyticsFocusedMetric,
  opportunityCostPerPerson: number,
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
      data,
      (v: AnalyticsDatapoint[]) => {
        switch (selectedMetric) {
          case AnalyticsFocusedMetric.MAX:
            return d3Array.max(v, d => d.max) || 0;
          case AnalyticsFocusedMetric.UTILIZATION:
            return d3Array.max(v, d => d.targetUtilization) || 0;
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
      (d: AnalyticsDatapoint) => d.spaceId,
      // @ts-ignore
      (d: AnalyticsDatapoint) => d.localBucketDay,
    )

    const series: ChartSegmentMultipleDays['series'] = [];
    const localBucketDaysWithData = new Set<string>();
    let maxMetricValue = 0;
    let minMetricValue = 0;
    dataset.forEach((dayValues: Map<string, number>, spaceId: string) => {
      if (hiddenSpaceIdsSet.has(spaceId)) return;
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
        spaceId,
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
      data,
      (v: AnalyticsDatapoint[]) => {
        switch (selectedMetric) {
          case AnalyticsFocusedMetric.MAX:
            return d3Array.max(v, d => d.max) || 0;
          case AnalyticsFocusedMetric.UTILIZATION:
            return d3Array.max(v, d => d.targetUtilization) || 0;
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
      (d: AnalyticsDatapoint) => d.spaceId,
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
      dayBreakdown.forEach((spaceBreakdown: Map<string, number>, spaceId: string) => {
        if (hiddenSpaceIdsSet.has(spaceId)) return;
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
          spaceId,
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

// used for 1d mode, gives evenly-spaced point locations for each day
function makeDayPointScale(days: string[], width: number) {
  return d3Scale.scalePoint()
    .domain(days)
    .range([0, width])
}

// used for 1h or 15m mode, makes each day into a band which will contain a point-scale for times
function makeDayRegionScale(days: string[], width: number) {
  return d3Scale.scaleBand()
    .domain(days)
    .range([0, width])
    .paddingInner(0)
    .paddingOuter(0)
}

// used for 1h or 15m mode to scale times within a day region (see above)
// NOTE: "width" here is the width of the band, not the whole chart
function makeDayTimesScale(times: string[], width: number) {
  return d3Scale.scalePoint()
    .domain(times)
    .range([0, width])
    .padding(0.2)
    .align(0)
}

// These are for the vertically stacked x-axis labels (eg. NOV 2019)
const LABEL_VERTICAL_STEP = 18;
const DAY_LABEL_VERTICAL_OFFSET = 26;
const MONTH_LABEL_VERTICAL_OFFSET = DAY_LABEL_VERTICAL_OFFSET + LABEL_VERTICAL_STEP;
const YEAR_LABEL_VERTICAL_OFFSET = MONTH_LABEL_VERTICAL_OFFSET + LABEL_VERTICAL_STEP;

const Chart: React.FC<{
  outerWidth: number,
  outerHeight: number,
  interval: QueryInterval,
  selectedMetric: AnalyticsFocusedMetric,
  opportunityCostPerPerson: number,
  hiddenSpaceIds: string[]
  datapoints: AnalyticsDatapoint[],
  spacesById: ReadonlyMap<string, DensitySpace>,
}> = function Chart({
  outerWidth,
  outerHeight,
  interval,
  selectedMetric,
  opportunityCostPerPerson,
  hiddenSpaceIds,
  datapoints,
  spacesById,
}) {

  const [mousePosition, setMousePosition] = React.useState<{ x: number, y: number } | null>(null);

  // TODO: probably need to memoize this result
  const chartData = computeChartData(datapoints, interval, selectedMetric, opportunityCostPerPerson, hiddenSpaceIds);

  const additionalSpaceNeededForYAxisLabels = (() => {
    const lengthOfMin = String(chartData.minMetricValue).length;
    const lengthOfMax = String(chartData.maxMetricValue).length;
    const worstCase = Math.max(lengthOfMin, lengthOfMax);
    const additionalCharacters = Math.max(0, worstCase - 2);
    return 8 * additionalCharacters;
  })()

  const padding = {
    top: 40,
    right: 40,
    bottom: 80,
    left: 54 + additionalSpaceNeededForYAxisLabels,
  }
  const width = outerWidth - (padding.left + padding.right);
  const height = outerHeight - (padding.top + padding.bottom);


  const whereIsADayPoint = makeDayPointScale(chartData.days, width);
  const whereDoesADayRegionStart = makeDayRegionScale(chartData.days, width);
  const timeScalesByDay = new Map<string, d3Scale.ScalePoint<string>>();
  if (interval !== QueryInterval.ONE_DAY) {
    chartData.segments.forEach(segment => {
      if (segment.type === 'TIMES_OF_SINGLE_DAY') {
        const timeScaleForThisDay = makeDayTimesScale(segment.times, whereDoesADayRegionStart.bandwidth())
        timeScalesByDay.set(segment.day, timeScaleForThisDay);
      }
    })
  }

  function computeHoverData(mouseX: number) {

    const datapoints: Array<{ spaceId: string, value: number }> = [];

    const dayXPositionsMap = new Map<number, string>();
    chartData.days.forEach(day => {
      const xPosition = interval === QueryInterval.ONE_DAY ? whereIsADayPoint(day) || 0 : whereDoesADayRegionStart(day) || 0;
      dayXPositionsMap.set(xPosition, day);
    })

    let nearestDayXPosition: number;
    if (interval === QueryInterval.ONE_DAY) {
      // @ts-ignore
      nearestDayXPosition = d3Array.least(Array.from(dayXPositionsMap.keys()), (x: number) => Math.abs(mouseX - x));
    } else {
      const dayXPositionsArray = Array.from(dayXPositionsMap.keys());
      const nearestDayXPositionIndex: number = d3Array.bisect(dayXPositionsArray, mouseX);
      nearestDayXPosition = dayXPositionsArray[nearestDayXPositionIndex - 1];
    }
    
    const nearestDay = dayXPositionsMap.get(nearestDayXPosition);
    if (!nearestDay) return null;

    if (interval === QueryInterval.ONE_DAY) {
      chartData.segments.forEach(segment => {
        if (segment.type !== 'MULTIPLE_DAYS') throw new Error('Should not be possible');
        segment.series.forEach(series => {
          series.data.forEach(datum => {
            if (datum.day === nearestDay) {
              datapoints.push({
                spaceId: series.spaceId,
                value: datum.value,
              })
            }
          })
          
        })
      })
      return {
        xPosition: nearestDayXPosition,
        day: nearestDay,
        time: null,
        datapoints,
      }
    } else {
      const segment = chartData.segments.find(segment => {
        if (segment.type !== 'TIMES_OF_SINGLE_DAY') throw new Error('Should not be possible');
        return segment.day === nearestDay;
      })
      if (!segment) return null;
      if (segment.type !== 'TIMES_OF_SINGLE_DAY') throw new Error('Should not be possible')
      
      // re-project this day's times
      const timeXPositionsMap = new Map<number, string>();
      const scale = timeScalesByDay.get(nearestDay);
      if (!scale) throw new Error('Should not be possible');
      segment.times.forEach(time => {
        timeXPositionsMap.set(scale(time) || 0, time);
      })
      // @ts-ignore
      const nearestTimeXPosition: number = d3Array.least(Array.from(timeXPositionsMap.keys()), (x: number) => Math.abs(mouseX - (nearestDayXPosition + x)));
      const nearestTime = timeXPositionsMap.get(nearestTimeXPosition);
      if (!nearestTime) return null;

      segment.series.forEach(series => {
        series.data.forEach(datum => {
          if (datum.time === nearestTime) {
            datapoints.push({
              spaceId: series.spaceId,
              value: datum.value,
            })
          }
        })
      })
      return {
        xPosition: nearestDayXPosition + nearestTimeXPosition,
        day: nearestDay,
        time: nearestTime,
        datapoints,
      }
    }
  }

  const TARGET_NUM_Y_TICKS = 5;

  // always show at least [0, 10], or [0, 100] if UTILIZATION is the metric
  const yScaleMinUpperBound = selectedMetric === AnalyticsFocusedMetric.UTILIZATION ? 100 : 10;
  const yScale = d3Scale.scaleLinear()
    .domain([chartData.minMetricValue, Math.max(yScaleMinUpperBound, chartData.maxMetricValue || 0)])
    .range([height, 0])
    // this will extend the domain to round-ish values so that the axis reads better
    .nice(TARGET_NUM_Y_TICKS);

  const yAxis = ((yScale: d3Scale.ScaleLinear<number, number>) => {
    const ticks = yScale.ticks(TARGET_NUM_Y_TICKS);
    const suffix = selectedMetric === AnalyticsFocusedMetric.UTILIZATION ? '%' : '';
    const formatLabel = (value: number) => {
      const commasDelimitedNumber = String(Math.ceil(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
      return `${commasDelimitedNumber}${suffix}`;
    }
    return (
      <g>
        {ticks.map(tick => {
          const y = yScale(tick)
          return (
            <g key={tick}>
              <line
                x1={-56}
                y1={y}
                x2={width + 40}
                y2={y}
                strokeDasharray={tick === 0 ? '4 2' : '2 4'}
                stroke={tick === 0 ? '#C1C4C8' : '#E1E4E8'}
              />
              <text
                x={-16}
                y={y - 8}
                fontSize={12}
                fill={'#6A737D'}
                dominantBaseline="middle"
                textAnchor="end"
              >{formatLabel(tick)}</text>
            </g>
          )
        })}
      </g>
    )
  })(yScale);


  const xAxis = ((chartData: ChartData) => {

    const dayLabelFontSize = 12;
    const widthNeededForAFullDayLabel = dayLabelFontSize * 7;
    const widthNeededForAnAbbreviatedDayLabel = dayLabelFontSize * 3;
    // eg. "Mon, 24" abbreviates to "24"
    let shouldAbbreviateDayLabel: boolean = false;
    let labeledDays: string[] = [];
    labeledDays.push(...chartData.days);

    while (labeledDays.length) {
      if (!shouldAbbreviateDayLabel && (width > widthNeededForAFullDayLabel * labeledDays.length)) {
        break;
      } else {
        // if we can't fit all labels as full labels we start abbreviating (show only day-of-month, not day-of-week)
        shouldAbbreviateDayLabel = true;
        // check if they all fit abbreviated
        if (width > widthNeededForAnAbbreviatedDayLabel * labeledDays.length) {
          break;
        }
        // Only one label remains, but there isn't room, so no days get labeled
        if (labeledDays.length === 1) {
          labeledDays = []
        } else {
          // try dropping every other label (using i+1 mod 2 so that the first label is kept)
          labeledDays = labeledDays.filter((d, i) => (i + 1) % 2)
        }
      }
    }


    return (
      <g>
        {chartData.segments.map(segment => {
          switch (segment.type) {
            case 'MULTIPLE_DAYS': {
              const dayPointScale = makeDayPointScale(segment.days, width);

              return segment.days.map(day => {
                const dayLabelText = moment(day, 'YYYY-MM-DD').format(shouldAbbreviateDayLabel ? 'D' : 'ddd, D');
                const x = dayPointScale(day) || 0;
                return (
                  <g key={day}>
                    <line
                      x1={x}
                      y1={-40}
                      x2={x}
                      y2={height}
                      strokeDasharray="1 4"
                      stroke="#E1E4E8"
                    />
                    {labeledDays.includes(day) ? (
                      <g>
                        <line
                          x1={x}
                          y1={0 - 56}
                          x2={x}
                          y2={height + DAY_LABEL_VERTICAL_OFFSET + LABEL_VERTICAL_STEP - 4}
                          strokeDasharray="2 4"
                          stroke={'#D1D5DA'}
                        />
                        <text
                          x={x + 4}
                          y={height + DAY_LABEL_VERTICAL_OFFSET - 2}
                          fill={'#6A737D'}
                          fontSize={dayLabelFontSize}
                          textAnchor={'start'}
                          dominantBaseline={'hanging'}
                        >{dayLabelText}</text>
                      </g>
                    ) : null}
                    {chartData.monthStartDates.includes(day) ? (
                      <g key={`monthlabel-${day}`}>
                        <line
                          x1={x}
                          y1={0 - 56}
                          x2={x}
                          y2={height + 80}
                          strokeDasharray="2 4"
                          stroke={'#D1D5DA'}
                        />
                        <text
                          x={x + 4}
                          y={height + MONTH_LABEL_VERTICAL_OFFSET + 2}
                          fill={'#6A737D'}
                          fontSize={12}
                          textAnchor={'start'}
                          dominantBaseline={'hanging'}
                        >{moment(day).format('MMM').toUpperCase()}</text>
                      </g>
                    ) : null}
                    {chartData.yearStartDates.includes(day) ? (
                      <g key={`yearlabel-${day}`}>
                        <line
                          x1={x}
                          y1={0 - 56}
                          x2={x}
                          y2={height + 80}
                          stroke={'#E1E4E8'}
                        />
                        <text
                          x={x + 4}
                          y={height + YEAR_LABEL_VERTICAL_OFFSET}
                          fill={'#6A737D'}
                          fontSize={12}
                          textAnchor={'start'}
                          dominantBaseline={'hanging'}
                        >{day.split('-')[0]}</text>
                      </g>
                    ) : null}
                  </g>
                )
              })
            }
            case 'TIMES_OF_SINGLE_DAY': {
              
              const dayStartXPos = whereDoesADayRegionStart(segment.day);
              if (dayStartXPos === undefined) {
                throw new Error(`Day was not found in dayRegionScale domain: ${segment.day}`);
              }
              const dayRegionWidth = whereDoesADayRegionStart.bandwidth();
              const xScale = timeScalesByDay.get(segment.day);
              if (!xScale) {
                throw new Error(`No time scale found for day: ${segment.day}`)
              }

              const timeOfDayLabelFontSize = 12;
              const maxLengthOfLabelText = interval === QueryInterval.ONE_HOUR ? 3 : 5;
              const widthNeededForATimeOfDayLabel = timeOfDayLabelFontSize * maxLengthOfLabelText;

              let labeledTimes: string[] = [];
              // put all the times in it to start
              labeledTimes.push(...segment.times);

              // remove the end label if there isn't room before the next segment
              if ((xScale.step() * xScale.padding()) < widthNeededForATimeOfDayLabel) {
                labeledTimes.pop();
              }

              while (labeledTimes.length) {
                if (dayRegionWidth >= widthNeededForATimeOfDayLabel * labeledTimes.length) {
                  break;
                } else {
                  // Only one label remains, but there isn't room, so no times get labeled
                  if (labeledTimes.length === 1) {
                    labeledTimes = []
                  } else {
                    // try dropping every other label (using i+1 mod 2 so that the first label is kept)
                    labeledTimes = labeledTimes.filter((d, i) => (i+1) % 2)
                  }
                }
              }

              return (
                <g key={segment.day} transform={`translate(${dayStartXPos}, 0)`}>
                  {labeledDays.includes(segment.day) ? (
                    <g key={`daylabel-${segment.day}`}>
                      <line
                        x1={0}
                        y1={0 - 56}
                        x2={0}
                        y2={height + DAY_LABEL_VERTICAL_OFFSET + LABEL_VERTICAL_STEP - 4}
                        strokeDasharray="2 4"
                        stroke={'#D1D5DA'}
                      />
                      <text
                        x={4}
                        y={height + DAY_LABEL_VERTICAL_OFFSET - 2}
                        fill={'#6A737D'}
                        fontSize={12}
                        textAnchor={'start'}
                        dominantBaseline={'hanging'}
                      >{moment(segment.day).format(shouldAbbreviateDayLabel ? 'D' : 'ddd, D')}</text>
                    </g>
                  ): null}
                  {labeledTimes.map(time => {
                    const x = xScale(time);
                    return (
                      <g key={time}>
                        <line
                          x1={x}
                          y1={0 - 56}
                          x2={x}
                          y2={height + DAY_LABEL_VERTICAL_OFFSET + LABEL_VERTICAL_STEP - 4}
                          strokeDasharray="2 4"
                          stroke={'#D1D5DA'}
                        />
                        <text
                          x={x}
                          y={height + 8}
                          fontSize={timeOfDayLabelFontSize}
                          fill={'#6A737D'}
                          textAnchor="start"
                          dominantBaseline="hanging"
                          transform={`translate(4, 0)`}
                        >{formatLocalBucketTimeLabel(time)}</text>
                      </g>
                    )
                  })}
                  {chartData.monthStartDates.includes(segment.day) ? (
                    <g key={`monthlabel-${segment.day}`}>
                      <line
                        x1={0}
                        y1={0 - 56}
                        x2={0}
                        y2={height + 80}
                        strokeDasharray="2 4"
                        stroke={'#D1D5DA'}
                      />
                      <text
                        x={4}
                        y={height + MONTH_LABEL_VERTICAL_OFFSET + 2}
                        fill={'#6A737D'}
                        fontSize={12}
                        textAnchor={'start'}
                        dominantBaseline={'hanging'}
                      >{moment(segment.day).format('MMM').toUpperCase()}</text>
                    </g>
                  ): null}
                  {chartData.yearStartDates.includes(segment.day) ? (
                    <g key={`yearlabel-${segment.day}`}>
                      <line
                        x1={0}
                        y1={0 - 56}
                        x2={0}
                        y2={height + 80}
                        stroke={'#E1E4E8'}
                      />
                      <text
                        x={4}
                        y={height + YEAR_LABEL_VERTICAL_OFFSET}
                        fill={'#6A737D'}
                        fontSize={12}
                        textAnchor={'start'}
                        dominantBaseline={'hanging'}
                      >{segment.day.split('-')[0]}</text>
                    </g>
                  ) : null}
                </g>
              )
            }
            default: {
              throw new Error('Invalid segment type');
            }
          }
        })}
      </g>
    )

  })(chartData);

  const lines = ((chartData: ChartData) => {
    return chartData.segments.map(segment => {
      switch (segment.type) {
        case 'MULTIPLE_DAYS': {
          const dayPointScale = makeDayPointScale(segment.days, width);
          
          const lineGen = d3Shape.line<{ day: string, value: number }>()
            .x(d => dayPointScale(d.day) || 0)
            .y(d => yScale(d.value))

          return segment.series.map(series => {
            const pathData = lineGen(series.data) || '';
            return (
              <g key={series.spaceId}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={colorScale(series.spaceId)}
                  strokeWidth={2}
                />
                {/* {series.data.map(d => {
                  return (
                    <circle
                      key={d.day}
                      cx={dayPointScale(d.day)}
                      cy={yScale(d.value)}
                      r={2}
                      fill={colorScale(series.spaceId)}
                      strokeWidth={1}
                      stroke={'#fafafa'}
                    />
                  )
                })} */}
              </g>
            )
          })
        }
        case 'TIMES_OF_SINGLE_DAY': {
          const dayStartXPos = whereDoesADayRegionStart(segment.day);
          const xScale = timeScalesByDay.get(segment.day);
          if (!xScale) {
            throw new Error(`No time scale found for day: ${segment.day}`)
          }
          const lineGen = d3Shape.line<{ time: string, value: number }>()
            .x(d => xScale(d.time) || 0)
            .y(d => yScale(d.value));

          return (
            <g key={segment.day} transform={`translate(${dayStartXPos}, 0)`}>
            {segment.series.map(series => {
              const pathData = lineGen(series.data) || '';
              return (
                <g key={series.spaceId}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={colorScale(series.spaceId)}
                    strokeWidth={2}
                  />
                </g>
              )
            })}
            </g>
          )
        }
        default: {
          throw new Error('Invalid segment type');
        }
      }
    })
  })(chartData)

  const onMouse = (evt: React.MouseEvent<SVGSVGElement>) => {
    const svg = evt.currentTarget;
    const bbox = svg.getBoundingClientRect();
    const xPos = evt.clientX - bbox.left;
    const yPos = evt.clientY - bbox.top
    const x = xPos - padding.left;
    const y = yPos - padding.top;
    setMousePosition({ x, y })
  }

  const onMouseLeave = (evt: React.MouseEvent<SVGSVGElement>) => {
    setMousePosition(null);
  }

  const tooltip = (() => {
    const hidden = { visible: false as const };
    if (mousePosition === null) return hidden;
    const hoverData = computeHoverData(mousePosition.x);
    if (hoverData === null) return hidden;
    const hoveredValue = yScale.invert(mousePosition.y);
    // @ts-ignore
    const targetDatapoint: typeof hoverData.datapoints[number] = d3Array.least(hoverData.datapoints, d => Math.abs(d.value - hoveredValue));
    if (!targetDatapoint) return hidden;
    const targetValue = targetDatapoint.value;
    const datapoints = hoverData.datapoints.map(d => {
      const space = spacesById.get(d.spaceId);
      if (!space) throw new Error('Should not be possible');
      return {
        spaceId: space.id,
        spaceName: space.name,
        value: d.value,
      }
    })

    const dateLabel = moment(hoverData.day).format('ddd, MMM D')
    const timeLabel = hoverData.time ? `, ${formatLocalBucketTimeLabel(hoverData.time, false)}` : '';
    const datetimeLabel = `${dateLabel}${timeLabel}`

    return {
      visible: true as const,
      datetimeLabel,
      xPosition: hoverData.xPosition,
      datapoints,
      targetValue,
      hoverData,
    }
  })();

  const highlightedDatapoints = tooltip.visible ? (() => {
    const { day, time } = tooltip.hoverData;
    
    let x: number;
    if (interval === QueryInterval.ONE_DAY) {
      x = whereIsADayPoint(day) || 0;
    } else {
      const timeScale = timeScalesByDay.get(day);
      if (!timeScale || !time) throw new Error('Should not be possible');
      x = (whereDoesADayRegionStart(day) || 0) + (timeScale(time) || 0);
    }

    return tooltip.datapoints.filter(datapoint => datapoint.value === tooltip.targetValue).map(datapoint => {
      const y = yScale(datapoint.value);
      return (
        <circle
          key={datapoint.spaceId}
          cx={x}
          cy={y}
          r={3} 
          fill={colorScale(datapoint.spaceId)}
          stroke={'#fafbfc'}
          strokeWidth={2}
        />
      )
    })
  })() : null;

  const getTooltipPositionStyles = (xPos: number) => {
    if (xPos > outerWidth / 2) {
      return {
        right: (outerWidth - (xPos + padding.left)) + 16,
      }
    } else {
      return {
        left: (xPos + padding.left) + 16
      }
    }
  }

  const hoverPositionMarker = tooltip.visible ? (
    <line
      x1={tooltip.xPosition}
      y1={-1 * padding.top}
      x2={tooltip.xPosition}
      y2={outerHeight}
      stroke={'#444D56'}
      strokeWidth={1}
      strokeDasharray={'2 4'}
    />
  ) : null;

  return (
    <div style={{position: 'relative'}}>
      <svg
        width={outerWidth}
        height={outerHeight}
        onMouseEnter={onMouse}
        onMouseMove={onMouse}
        onMouseLeave={onMouseLeave}
      >
        <rect x={0} y={0} width={outerWidth} height={outerHeight} fill={'#FAFBFC'} />
        <g transform={`translate(${padding.left},${padding.top})`}>
          {xAxis}
          <g key='baseline'>
            <line
              x1={-56}
              y1={height + MONTH_LABEL_VERTICAL_OFFSET - 4}
              x2={width + 40}
              y2={height + MONTH_LABEL_VERTICAL_OFFSET - 4}
              stroke="#E1E4E8"
            />
          </g>
          {yAxis}
          {hoverPositionMarker}
          {lines}
          {highlightedDatapoints}
        </g>
      </svg>
      {tooltip.visible ? (
        <div style={Object.assign({}, {
          position: 'absolute',
          top: padding.top,
          pointerEvents: 'none',
        }, getTooltipPositionStyles(tooltip.xPosition))}>
          <AnalyticsLineChartTooltip
            datetimeLabel={tooltip.datetimeLabel}
            datapoints={tooltip.datapoints}
            targetValue={tooltip.targetValue}
            selectedMetric={selectedMetric}
          />
        </div>
      ): null}
    </div>
  )
}

const AnalyticsChart: React.FC<{
  report: AnalyticsReport,
  spacesById: ReadonlyMap<string, DensitySpace>,
}> = function AnalyticsChart({
  report,
  spacesById,
}) {

  const container = useRef<HTMLDivElement>(null);
  const outerWidth = useContainerWidth(container);
  const outerHeight = 300;

  // when viewing metrics based on capacity, hide spaces for which capacity is not defined
  const hiddenSpaceIds = (() => {
    if (report.selectedMetric === AnalyticsFocusedMetric.UTILIZATION || report.selectedMetric === AnalyticsFocusedMetric.OPPORTUNITY) {
      if (report.queryResult.status !== ResourceStatus.COMPLETE) return report.hiddenSpaceIds;
      const additionalHiddenSpaceIds = report.queryResult.data.selectedSpaceIds.filter(spaceId => {
        const space = spacesById.get(spaceId);
        if (!space) return false;
        if (space.targetCapacity == null) return true;
        return false;
      });
      return report.hiddenSpaceIds.concat(additionalHiddenSpaceIds);
    }
    return report.hiddenSpaceIds;
  })()

  return (
    <div ref={container} style={{ width: '100%', height: outerHeight }}>
    {(() => {
      switch (report.queryResult.status) {
        case ResourceStatus.IDLE: {
          return (
            <div className={styles.chartContainer}>
              <p className={styles.emptyStateText}>Select some spaces to run a query</p>
              <img alt="" className={styles.analyticsIntroImage} src={analyticsIntroImage} />
            </div>
          )
        }
        case ResourceStatus.ERROR: {
          return (
            <div className={styles.chartContainer}>
              <p className={styles.emptyStateText}>Whoops, something went wrong.</p>
            </div>
          )
        }
        case ResourceStatus.LOADING: {
          return (
            <div className={styles.chartContainer}>
              <AnalyticsLoadingBar width={400} />
            </div>
          )
        }
        case ResourceStatus.COMPLETE: {
          return report.queryResult.data.selectedSpaceIds.length ? (
            <Chart
              outerWidth={outerWidth}
              outerHeight={outerHeight}
              interval={report.query.interval}
              selectedMetric={report.selectedMetric}
              opportunityCostPerPerson={report.opportunityCostPerPerson}
              hiddenSpaceIds={hiddenSpaceIds}
              datapoints={report.queryResult.data.datapoints}
              spacesById={spacesById}
            />
          ) : (
            <div className={styles.chartContainer}>
              <p className={styles.emptyStateText}>Select some spaces to run a query</p>
              <img alt="" className={styles.analyticsIntroImage} src={analyticsIntroImage} />
            </div>
          )
        }
      }
    })()}
    </div>
  )
}

export default AnalyticsChart;