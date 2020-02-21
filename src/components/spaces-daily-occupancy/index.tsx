import React, { useRef, RefObject } from 'react';
import moment, { Moment } from 'moment';

import commaNumber from 'comma-number';
import * as d3Scale from 'd3-scale';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { Icons } from '@density/ui';
import colors from '@density/ui/variables/colors.json';
import spacing from '@density/ui/variables/spacing.json';
import { SpaceMetaField, SpaceDetailCardLoading } from '../spaces-snippets';
import { SpacesPageState } from '../../rx-stores/spaces-page/reducer';

const CHART_HEIGHT = 80;
const CHART_WIDTH = 302;

function handleHover(
  chartRef: RefObject<HTMLDivElement>,
  hoverGroupRef: RefObject<HTMLDivElement>,
  hoverTimeRef: RefObject<HTMLDivElement>,
  hoverValueRef: RefObject<HTMLSpanElement>,
  hoverLineRef: RefObject<HTMLDivElement>,
  hoverMarkerRef: RefObject<HTMLDivElement>,
  xScale: Function,
  inverseXScale: Function,
  yScale: Function,
  space: CoreSpace,
  startTime: Moment,
  chartData: Array<{timestamp: Moment, value: number}>,
  event: React.MouseEvent,
) {
  const xPos = chartRef.current ? event.clientX - chartRef.current.getBoundingClientRect().left : 0;
  const yPos = chartRef.current ? event.clientY - chartRef.current.getBoundingClientRect().top : 0;
  const xStart = startTime.valueOf();
  const xTime = inverseXScale(xPos);
  let xValue = null as number | null;

  // If mouse is over the chart data, get the point immediately preceding the mouse cursor position
  if (yPos >= 0 && yPos <= 140) {
    for(let i = 0; i < chartData.length - 1; i++) {
      if (xTime >= xStart && xTime < chartData[i+1].timestamp.valueOf()) {
        xValue = chartData[i].value;
        break;
      } else {
        xValue = null;
      }
    }
  }

  // Efficiently do the hover by manipulating RAW DOM NODES :spooky:
  // But seriously, watch out for XSS when doing anything similar to this
  const markerXPos = encodeURI(xValue !== null ? `${xScale(xTime)}px` : '-999px');
  if (hoverGroupRef.current && hoverTimeRef.current && hoverValueRef.current && hoverLineRef.current && hoverMarkerRef.current) {
    hoverGroupRef.current.style.left = markerXPos;
    hoverTimeRef.current.innerHTML = moment.tz(xTime, space.time_zone).format('h:mma ddd MMM Do').replace(/(a|p)m/, '$1');
    hoverValueRef.current.innerHTML = encodeURI(commaNumber(xValue) || '');
    hoverLineRef.current.style.left = markerXPos;
    hoverMarkerRef.current.style.top = `${yScale(xValue) + 2}px`;
  }
}

export default function SpaceDailyOccupancy ({
  space,
  date,
  isToday,
  dailyOccupancy,
}: {
  space: CoreSpace,
  date: Moment,
  isToday: boolean,
  dailyOccupancy: SpacesPageState['dailyOccupancy'],
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const hoverGroupRef = useRef<HTMLDivElement>(null);
  const hoverTimeRef = useRef<HTMLDivElement>(null);
  const hoverValueRef = useRef<HTMLSpanElement>(null);
  const hoverLineRef = useRef<HTMLDivElement>(null);
  const hoverMarkerRef = useRef<HTMLDivElement>(null);

  const calculatedData = dailyOccupancy.buckets;
  const startTime = moment.utc(date).tz(space.time_zone).startOf('day');
  const endTime = moment.utc(date).tz(space.time_zone).endOf('day');

  const chartData = calculatedData.map(i => ({
    timestamp: moment.tz(i.timestamp, space.time_zone),
    value: i.interval.analytics.max,
  })).sort((a, b) => b ? a.timestamp.valueOf() - b.timestamp.valueOf() : 0);

  // Final point for "completed" days (all but today)
  if (chartData.length > 0 && !isToday) {
    chartData.push({
      timestamp: endTime.clone(),
      value: chartData[chartData.length-1].value,
    });
  }

  const ticks = [0,1,2,3].map(i => startTime.clone().add(i*6, 'hours'));
  const xScale = d3Scale.scaleTime()
    .domain([startTime, endTime])
    .range([0, CHART_WIDTH]);
  const inverseXScale = d3Scale.scaleLinear()
    .domain([0, CHART_WIDTH])
    .range([startTime.valueOf(), endTime.valueOf()]);
  const yScale = d3Scale.scaleLinear()
    .domain([0, Math.max(dailyOccupancy.metrics.peak, space.capacity || 1)])
    .range([CHART_HEIGHT - 10, 1]);

  return dailyOccupancy.status === 'COMPLETE' ? <div
    ref={chartRef}
    style={{width: '100%', position: 'relative', paddingBottom: 12}}
    onMouseOut={event => handleHover(chartRef, hoverGroupRef, hoverTimeRef, hoverValueRef, hoverLineRef, hoverMarkerRef, xScale, inverseXScale, yScale, space, startTime, chartData, event)}
    onMouseMove={event => handleHover(chartRef, hoverGroupRef, hoverTimeRef, hoverValueRef, hoverLineRef, hoverMarkerRef, xScale, inverseXScale, yScale, space, startTime, chartData, event)}
  >
    <div style={{display: 'flex', marginBottom: -16}}>
      <SpaceMetaField
        label="Capacity"
        value={space.capacity === null ? '--' : space.capacity}
        compact={true} />
      <SpaceMetaField
        label="Peak"
        value={commaNumber(dailyOccupancy.metrics.peak)}
        compact={true} />
    </div>
    <svg height={CHART_HEIGHT} width={CHART_WIDTH} preserveAspectRatio="none">
      <path stroke={colors.blueLight} fill={colors.blueLight}  d={`
        M${xScale(startTime)},${yScale(0) + 10}V${yScale(chartData[0].value)}
        ${chartData.map(point => `H${xScale(point.timestamp)}V${yScale(point.value)}`)}
        V${yScale(0) + 10}
      `} />
      <path stroke={colors.blue} strokeWidth={1} fill={'transparent'} d={`
        M${xScale(startTime)},${yScale(chartData[0].value)}
        ${chartData.map(point => `H${xScale(point.timestamp)}V${yScale(point.value)}`)}
      `} />
    </svg>
    <div>
      {ticks.map(tick => <div
        key={tick.valueOf()}
        style={{position: 'absolute', left: xScale(tick), paddingTop: 2, fontSize: 12}}
      >
        {tick.format('ha').slice(0, -1)}
      </div>)}
    </div>
    <div ref={hoverGroupRef} style={{
      position: 'absolute',
      top: 18,
      left: -999,
      fontSize: 12,
      fontWeight: 500,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transform: 'translateX(-50%)',
    }}>
      <div style={{
        backgroundColor: colors.white,
        display: 'flex',
        alignItems: 'center',
        padding: '0 7px',
        height: 24,
        border: `1px solid ${colors.gray300}`,
        borderRadius: spacing.borderRadiusBase,
        boxShadow: `0px 2px 4px ${colors.midnightTransparent10}`,
      }}>
        <Icons.Person width={16} height={16} />
        &nbsp;
        <span ref={hoverValueRef}></span>
      </div>
      <div ref={hoverTimeRef} style={{
        backgroundColor: colors.white,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        padding: '0 7px',
        height: 24,
        marginTop: 78,
        border: `1px solid ${colors.gray300}`,
        borderRadius: spacing.borderRadiusBase,
        boxShadow: `0px 2px 4px ${colors.midnightTransparent10}`,
      }}></div>
    </div>
    <div ref={hoverLineRef} style={{
      backgroundColor: colors.gray500,
      position: 'absolute',
      left: -999,
      top: 44,
      width: 1,
      height: 78,
      transform: 'translateX(-.5px)',
    }}>
      <div ref={hoverMarkerRef} style={{
        backgroundColor: colors.blue,
        position: 'absolute',
        top: -999,
        width: 4,
        height: 4,
        borderRadius: 2,
        transform: 'translateX(-1.5px)',
      }}></div>
    </div>
  </div> : <SpaceDetailCardLoading />
}
