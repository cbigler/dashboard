/* eslint-disable import/first */
import React from 'react';
import { scaleLinear, scaleUtc } from 'd3-scale';
import moment from 'moment';
import { storiesOf } from '@storybook/react';

import { BoxPadding } from '../../types/geometry';

import AnalyticsAxisGrid from '.';


// helper for this story
const gridWithSettings = ({ width, height, padding, xScale, yScale }) => {
  const outerWidth = padding.left + width + padding.right;
  const outerHeight = padding.top + height + padding.bottom;
  return (
    <svg width={outerWidth} height={outerHeight}>
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        <AnalyticsAxisGrid
          xScale={xScale}
          yScale={yScale}
          width={width}
          height={height}
          padding={padding}
        />
      </g>
    </svg>
  )
}

/** 
 * NOTE: using 960px as the minimum supported width for now.
 * 
 * The assumption is that if we support the narrowest case,the wider cases will be fine
 * because the primary issue is crowding/collision of labels
 */
const width = 960;
const height = 200;
const padding = { top: 64, right: 8, bottom: 90, left: 56 };

const yScale = scaleLinear()
  .domain([0, 10])
  .range([height, 0])

const testDateRange = (startDate: string, endDate: string) => {
  const xScale = scaleUtc()
    .domain([+moment.utc(startDate), +moment.utc(endDate)])
    .range([0, width]);
  return gridWithSettings({
    width,
    height,
    padding,
    xScale,
    yScale,
  })
}

storiesOf('Analytics / Axis Grid', module)
  .add('1 day', () => testDateRange('2019-07-05', '2019-07-06'))
  .add('3 days', () => testDateRange('2019-09-05', '2019-09-08'))
  .add('7 days, across month boundary', () => testDateRange('2019-04-28', '2019-05-04'))
  .add('30 days', () => testDateRange('2019-06-01', '2019-06-30'))
  .add('3 months', () => testDateRange('2019-02-01', '2019-05-01'))
  .add('3 months, across year boundary', () => testDateRange('2018-11-01', '2019-02-01'))
  
