import React from 'react';
import moment from 'moment-timezone';
import * as d3Scale from 'd3-scale';
import * as d3Time from 'd3-time';
// @ts-ignore
import eachCons from 'each-cons';

import fontVariables from '@density/ui/variables/fonts.json';
import { BoxPadding } from '../../types/geometry';


type TimeAxisScale = d3Scale.ScaleTime<number, number>
const TimeAxisScale = {
  computeDaysSpanned: (scale: TimeAxisScale): number => {
    const [startDate, endDate] = scale.domain();
    const duration = moment.duration((+endDate) - (+startDate));
    return duration.as('days');
  }
}


type MarksGroup = {
  ticks: Date[],
  format: (d: Date) => string
}

const NO_MARKS: MarksGroup = {
  ticks: [],
  format: () => ''
}

type TimeAxisMarks = {
  day: MarksGroup,
  hour: MarksGroup,
  dayOfWeek: MarksGroup
}


// REVIEW: this is egregiously un-DRY, but I like that it's explicit for this particular task
// NOTE: dayOfWeek isn't being used yet, but is stubbed out here because we probably will use it soon
function generateTimeAxisMarks(scale: TimeAxisScale): TimeAxisMarks {
  const numDaysSpanned = TimeAxisScale.computeDaysSpanned(scale);

  if (numDaysSpanned === 1) {
    return {
      day: {
        ticks: scale.ticks(d3Time.utcDay),
        format: d => moment.utc(d).format('ddd, D'),
      },
      hour: {
        ticks: scale.ticks(d3Time.utcHour),
        format: d => moment.utc(d).format('ha').replace('m', ''),
      },
      dayOfWeek: NO_MARKS
    };
  }
  if (numDaysSpanned < 4) {
    return {
      day: {
        ticks: scale.ticks(d3Time.utcDay),
        format: d => moment.utc(d).format('ddd, D'),
      },
      hour: {
        ticks: scale.ticks(d3Time.utcHour.every(3) as d3Time.TimeInterval),
        format: d => moment.utc(d).format('ha').replace('m', ''),
      },
      dayOfWeek: NO_MARKS
    }
  }
  if (numDaysSpanned < 7) {
    return {
      day: {
        ticks: scale.ticks(d3Time.utcDay),
        format: d => moment.utc(d).format('ddd, D'),
      },
      hour: {
        ticks: scale.ticks(d3Time.utcHour.every(12) as d3Time.TimeInterval),
        format: d => moment.utc(d).format('ha').replace('m', ''),
      },
      dayOfWeek: NO_MARKS
    } 
  }
  if (numDaysSpanned < 15) {
    return {
      day: {
        ticks: scale.ticks(d3Time.utcDay),
        format: d => moment.utc(d).format('ddd, D'),
      },
      hour: NO_MARKS,
      dayOfWeek: NO_MARKS,
    }
  }
  if (numDaysSpanned < 32) {
    return {
      day: {
        ticks: scale.ticks(d3Time.utcDay),
        format: d => moment.utc(d).format('D'),
      },
      hour: NO_MARKS,
      dayOfWeek: NO_MARKS,
    }
  }
  if (numDaysSpanned < 93) {
    return {
      day: {
        ticks: scale.ticks(d3Time.utcDay.filter(d => [1, 15].includes(d.getUTCDate()))),
        format: d => moment.utc(d).format('ddd, D'),
      },
      hour: NO_MARKS,
      dayOfWeek: NO_MARKS,
    }
  }
  return {
    day: NO_MARKS,
    hour: NO_MARKS,
    dayOfWeek: NO_MARKS,
  };

}

const AnalyticsAxisGrid: React.FunctionComponent<{
  xScale: d3Scale.ScaleTime<number, number>
  yScale: d3Scale.ScaleLinear<number, number>
  width: number
  height: number
  padding: BoxPadding
}> = React.memo(function Grid({ xScale, yScale, width, height, padding }) {

  const metricTicks = yScale.ticks(5);

  const marks = generateTimeAxisMarks(xScale);
  
  const [start, end] = xScale.domain();

  const createRanges = (start: Date, end: Date, interval: d3Time.TimeInterval) => {
    const ticks = interval.range(interval.floor(start), interval.ceil(end));
    // add one more datapoint at the end
    const lastTick = ticks[ticks.length - 1];
    const additionalTick = interval.ceil(new Date(+lastTick + 1));
    ticks.push(additionalTick);
    return eachCons(ticks, 2);
  }

  const yearRanges = createRanges(start, end, d3Time.utcYear);
  const monthRanges = createRanges(start, end, d3Time.utcMonth);
  // NOTE: keeping these around in case we need them later for short intervals
  // const dayRanges = createRanges(start, end, d3Time.utcDay);
  // const hourRanges = createRanges(start, end, d3Time.utcHour);

  const METRIC_MARKS = metricTicks.map((tick, i) => (
    <g key={i} transform={`translate(0, ${yScale(tick)})`}>
      <line x1={-56} x2={width} y1={0} y2={0} stroke="#DADADA" strokeDasharray="2 4"></line>
      <text fontSize={12} fill="#676F6F" x={-16} y={1} dominantBaseline="middle" textAnchor="end">{tick.toString()}</text>
    </g>
  ))

  const YEAR_MARKS = yearRanges.map(([start, end], i) => {
    const x = Math.max(xScale(start), 0)
    return (
      <g key={i} transform={`translate(${x}, ${height + 60})`}>
        <text dx={4} dy={10} dominantBaseline="middle" fontSize={12} fill="#676F6F">
          {moment.utc(start).format('YYYY')}
        </text>
      </g>
    )
  })

  const MONTH_MARKS = monthRanges.map(([start, end], i) => {
    const x = Math.max(xScale(start), 0)
    return (
      <g key={i} transform={`translate(${x}, ${height + 40})`}>
        {/* <rect x={x - 56} y={0} width={w + 64} height={1} fill="#EDEDED" stroke="none" /> */}
        <text dx={4} dy={13} dominantBaseline="middle" fontSize={12} fill="#676F6F">
          {moment.utc(start).format('MMM').toUpperCase()}
        </text>
      </g>
    )
  })

  const DAY_MARKS = marks.day.ticks.map((tick, i) => {
    const x = xScale(tick);
    const text = marks.day.format(tick)
    return (
      <g key={i} transform={`translate(${x}, 0)`}>
        <line x1={0} x2={0} y1={-padding.top} y2={height + 40} strokeDasharray="3 3" stroke="#DADADA" />
        <text dx={4} y={height + 28} dominantBaseline="middle" fontSize={12} fill="#676F6F">{text}</text>
      </g>
    )
  })

  const HOUR_MARKS = marks.hour.ticks.map((tick, i) => {
    const x = xScale(tick);
    const text = marks.hour.format(tick)
    return (
      <g key={i} transform={`translate(${x}, ${height})`}>
        <line x1={0} x2={0} y1={-padding.top - height} y2={40} strokeDasharray="3 3" stroke="#DADADA" />
        <text x={4} y={5} textAnchor="start" dominantBaseline="hanging" fontSize={12} fill="#676F6F">{text}</text>
      </g>
    )
  })

  return (
    <g fontFamily={fontVariables.fontBase}>
      <g>{METRIC_MARKS}</g>
      <g>{YEAR_MARKS}</g>
      <g>{MONTH_MARKS}</g>
      <line
        x1={-padding.left}
        x2={width + padding.right}
        y1={height + 40}
        y2={height + 40}
        stroke="#EDEDED"
      />
      <g>{DAY_MARKS}</g>
      <g>{HOUR_MARKS}</g>
    </g>
  )
})

export default AnalyticsAxisGrid;
