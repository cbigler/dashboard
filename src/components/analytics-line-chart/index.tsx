import React, { Fragment, useMemo, useRef, useState } from 'react';
import moment, { Moment } from 'moment';
import * as d3Shape from 'd3-shape';
import * as d3Scale from 'd3-scale';

import { Point2D, BoxPadding } from '../../types/geometry';
import {
  AnalyticsDatapoint,
  AnalyticsReport,
  ResourceStatus,
  AnalyticsFocusedMetric,
  QueryInterval,
} from '../../types/analytics';
import { groupBy, findLeast } from '../../helpers/array-utilities';
import analyticsColorScale from '../../helpers/analytics-color-scale';
import { parseIntervalAsDuration } from '../../helpers/space-time-utilities';
import { mousePointRelativeToSVGElement } from '../../helpers/svg';
import useContainerWidth from '../../helpers/use-container-width';
import AnalyticsAxisGrid from '../analytics-axis-grid';
import AnalyticsLineChartTooltip from '../analytics-line-chart-tooltip';
import AnalyticsLoadingBar from '../analytics-loading-bar';

import { computeBuckets, displayTimestamp, getTooltipPosition, formatDateLabelForTooltip } from './helpers';
import { HoverState, AnalyticsReportLoaded } from './types';
import styles from './styles.module.scss';


const ChartPlaceholder: React.FunctionComponent = function ChartPlaceholder(props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    }}>
      <div>{props.children}</div>
    </div>
  )
}

const SVGMouseHoverTarget: React.FunctionComponent<{
  width: number,
  height: number,
  padding: BoxPadding,
  onChange: (value: Point2D | null) => any,
}> = function SVGMouseHoverTarget({ width, height, padding, onChange }) {
  const onMouse = (evt: React.MouseEvent<SVGRectElement>) => {
    const point = mousePointRelativeToSVGElement(evt.nativeEvent, evt.currentTarget);
    
    // adjust for left padding, clamp [0, width]
    const x = Math.max(0, Math.min(width, point.x - padding.left))
    // adjust for top padding, clamp [0, height]
    const y = Math.max(0, Math.min(height, point.y - padding.top))
  
    onChange({ x, y });
  }
  const onMouseLeave = () => {
    onChange(null);
  }
  return (
    <rect
      x={0}
      y={0}
      width={padding.left + width + padding.right}
      height={padding.top + height + padding.bottom}
      fill="transparent"
      stroke="none"
      onMouseOver={onMouse}
      onMouseMove={onMouse}
      onMouseLeave={onMouseLeave}
    />
  )
}

const LineChart: React.FunctionComponent<{
  datapoints: AnalyticsDatapoint[],
  startDate: Moment,
  endDate: Moment,
  interval: QueryInterval,
  selectedMetric: AnalyticsFocusedMetric,
  width: number,
  height: number,
  padding: BoxPadding,
  hoverState: HoverState,
  onHoverStateChange: (hoverState: HoverState) => void,
}> = function LineChart({ datapoints, startDate, endDate, interval, selectedMetric, width, height, padding, hoverState, onHoverStateChange }) {

  const intervalDuration = useMemo(() => parseIntervalAsDuration(interval), [interval]);

  const startDateIdentity = startDate.valueOf();
  const endDateIdentity = endDate.valueOf();
  const intervalDurationIdentity = intervalDuration.valueOf();

  // NOTE: disabling the eslint check for the hook below, because the memo 
  //       uses the epoch value for each Moment to determine equality,
  //       rather than object identity, since a Moment is mutable.

  /* eslint-disable react-hooks/exhaustive-deps */
  const [buckets, overallMaxMetricValue] = useMemo(
    () => computeBuckets(startDate, endDate, intervalDuration, datapoints, selectedMetric),
    [startDateIdentity, endDateIdentity, intervalDurationIdentity, datapoints, selectedMetric]
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  const maxValueY = selectedMetric === AnalyticsFocusedMetric.UTILIZATION ?
    Math.max(overallMaxMetricValue, 100) :
    Math.max(overallMaxMetricValue, 10);
  
  const xScale = d3Scale.scaleUtc()
    .domain([
      startDate.valueOf(),
      endDate.valueOf()
    ])
    .range([0, width])

  const yScale = d3Scale.scaleLinear()
    .domain([0, maxValueY])
    .range([height, 0])
    .nice();

  const handleHoverChange = (point: Point2D | null) => {
    const fail = () => onHoverStateChange({ isHovered: false })
    if (point == null) return fail();
    const { x, y } = point;
    const xValue = +xScale.invert(x);
    const yValue = yScale.invert(y);
    const bucket = buckets.find(t => xValue >= t.start && xValue <= t.end);
    if (!bucket) return fail();
    const nearestMatch = findLeast(bucket.datapoints, d => Math.abs(d[selectedMetric] - yValue))
    if (!nearestMatch) return fail();
    const metricValue = nearestMatch[selectedMetric];
    const exactMatchingDatapoints = bucket.datapoints.filter(d => d[selectedMetric] === nearestMatch[selectedMetric])
    return onHoverStateChange({
      isHovered: true,
      x: {
        value: bucket.middle,
        position: xScale(bucket.middle),
      },
      y: {
        value: metricValue,
        position: yScale(metricValue),
      },
      bucket,
      exactMatchingDatapoints,
    })
  }

  const lineGenerator = d3Shape.line<AnalyticsDatapoint>()
    .x(d => xScale(displayTimestamp(d)))
    .y(d => yScale(d[selectedMetric]))
    .curve(d3Shape.curveMonotoneX)

  const lineData = groupBy(datapoints, d => d.spaceId)
    // generate line data for each space
    .map(([spaceId, countData]) => [spaceId, lineGenerator(countData)]) as [string, string][]

  const outerWidth = padding.left + width + padding.right;
  const outerHeight = padding.top + height + padding.bottom;

  const PLOTTED_LINES = lineData.map(([spaceId, pathData]) => (
    <g key={spaceId}>
      <path
        d={pathData}
        stroke={analyticsColorScale(spaceId)}
        fill="none"
        strokeWidth={1.5}
      />
    </g>
  ));

  const VERTICAL_CURSOR = hoverState.isHovered ? (
    <g>
      <line
        x1={hoverState.x.position}
        x2={hoverState.x.position}
        y1={-padding.top}
        y2={height + 40}
        stroke="#0D183A"
        strokeDasharray="3 3"
        strokeWidth={1}
        strokeOpacity={1}
      />
    </g>
  ) : null;

  const HIGHLIGHTED_DATAPOINT_CIRCLES = hoverState.isHovered ? (
    hoverState.exactMatchingDatapoints.map(d => (
      <g key={d.spaceId}>
        <circle
          cx={xScale(displayTimestamp(d))}
          cy={yScale(d[selectedMetric])}
          r={3}
          fill={analyticsColorScale(d.spaceId)}
          stroke="none"
        />
      </g>
    )) 
  ) : null;
  
  return (
    <svg width={outerWidth} height={outerHeight} viewBox={`0 0 ${outerWidth} ${outerHeight}`}>
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        <AnalyticsAxisGrid
          xScale={xScale}
          yScale={yScale}
          width={width}
          height={height}
          padding={padding}
        />
        {PLOTTED_LINES}
        {VERTICAL_CURSOR}
        {HIGHLIGHTED_DATAPOINT_CIRCLES}
      </g>
      <SVGMouseHoverTarget
        width={width}
        height={height}
        padding={padding}
        onChange={handleHoverChange}
      />
    </svg>
  )
}

/**
 * **ChartView**
 * - Parses `report` data into `LineChart` props 
 * - Responsible for hover state
 * - Positions the tooltips
 */
const ChartView: React.FunctionComponent<{
  report: AnalyticsReportLoaded,
  startDate: Moment,
  endDate: Moment,
  width: number,
  height: number,
  padding: BoxPadding,
}> = function ChartView({ report, startDate, endDate, width, height, padding }) {

  const [hoverState, setHoverState] = useState<HoverState>({
    isHovered: false
  });

  const endOfCurrentMinute = moment.utc().endOf('minute').valueOf();

  // This filters out hidden spaces (table checkboxes) and also removes datapoints in the future (API bug)
  const visibleDatapoints = useMemo(() => {
    return report.queryResult.data.datapoints
      .filter(datapoint => {
        const isCheckedInTable = !report.hiddenSpaceIds.includes(datapoint.spaceId);
        const isNotInTheFuture = datapoint.startActualEpochTime < endOfCurrentMinute;
        return isCheckedInTable && isNotInTheFuture;
      })
  }, [
    report.queryResult.data.datapoints,
    report.hiddenSpaceIds,
    endOfCurrentMinute,
  ])  

  const LEGEND_TOOLTIP = hoverState.isHovered ? (
    <div style={{
      pointerEvents: 'none',
      position: 'absolute',
      ...getTooltipPosition(width, padding, hoverState),
    }}>
      <AnalyticsLineChartTooltip
        datapoints={hoverState.bucket.datapoints}
        selectedMetric={report.selectedMetric}
        targetValue={hoverState.y.value}
      />
    </div>
  ) : null;

  const DATETIME_TOOLTIP = hoverState.isHovered ? (
    <div style={{
      pointerEvents: 'none',
      position: 'absolute',
      top: padding.top + height + 28,
      left: padding.left + hoverState.x.position,
    }}>
      <div className={styles.datetimeTooltip}>
        {formatDateLabelForTooltip(hoverState.bucket.start, report.query.interval)}
      </div>
    </div>
  ) : null;


  return (
    <Fragment>
      <LineChart
        datapoints={visibleDatapoints}
        startDate={startDate}
        endDate={endDate}
        interval={report.query.interval}
        selectedMetric={report.selectedMetric}
        width={width}
        height={height}
        padding={padding}
        hoverState={hoverState}
        onHoverStateChange={setHoverState}
      />
      {LEGEND_TOOLTIP}
      {DATETIME_TOOLTIP}
    </Fragment>
  )
}

const AnalyticsLineChart: React.FunctionComponent<{
  report: AnalyticsReport,
  startDate: Moment,
  endDate: Moment,
  outerHeight?: number,
  padding?: BoxPadding,
}> = function AnalyticsLineChart({
  report,
  startDate,
  endDate,
  outerHeight = 354,
  padding = { top: 64, right: 8, bottom: 90, left: 56 },
}) {
  
  const container = useRef<HTMLDivElement>(null);
  const outerWidth = useContainerWidth(container);

  // these represent the "inner" width/height of the drawable portion of the chart
  const width = outerWidth - (padding.left + padding.right);
  const height = outerHeight - (padding.top + padding.bottom);

  return (
    <div ref={container} style={{ height: outerHeight }} className={styles.analyticsLineChart}>
      {report.queryResult.status === ResourceStatus.IDLE ? (
        <ChartPlaceholder>Select some spaces to run a query</ChartPlaceholder>
      ) : report.queryResult.status === ResourceStatus.LOADING ? (
        <ChartPlaceholder>
          <AnalyticsLoadingBar width={400} />
        </ChartPlaceholder>
      ) : report.queryResult.status === ResourceStatus.COMPLETE && report.queryResult.data.selectedSpaceIds.length === 0 ? (
        <ChartPlaceholder>Select some spaces to run a query</ChartPlaceholder>
      ) : (
        <ChartView
          width={width}
          height={height}
          padding={padding}
          report={report as AnalyticsReportLoaded}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  )
}

export default React.memo(AnalyticsLineChart, (prevProps, nextProps) => {
  return (
    Object.is(prevProps.startDate.valueOf(), nextProps.startDate.valueOf()) &&
    Object.is(prevProps.endDate.valueOf(), nextProps.endDate.valueOf()) &&
    Object.is(prevProps.report, nextProps.report) &&
    Object.is(prevProps.outerHeight, nextProps.outerHeight) &&
    Object.is(prevProps.padding, nextProps.padding)
  )
});
