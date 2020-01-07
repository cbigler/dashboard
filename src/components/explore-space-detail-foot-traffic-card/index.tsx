import React, { useRef } from 'react';
import classnames from 'classnames';

import moment from 'moment';

import styles from './styles.module.scss';

import {
  Card,
  CardBody,
  CardHeader,
  CardLoading,
  Icons,
  InfoPopup,
} from '@density/ui/src';

import {
  DEFAULT_TIME_SEGMENT_GROUP,
  parseStartAndEndTimesInTimeSegment,
} from '../../helpers/time-segments/index';
import { parseISOTimeAtSpace } from '../../helpers/space-time-utilities/index';

import { calculateFootTraffic } from '../../rx-actions/route-transition/explore-space-daily';

import lineChart, { dataWaterline } from '@density/chart-line-chart';
import { xAxisDailyTick, yAxisMinMax } from '@density/chart-line-chart/dist/axes';
import {
  overlayTwoPopups,
  overlayTwoPopupsPersonIconTextFormatter,
  overlayTwoPopupsPlainTextFormatter,
} from '@density/chart-line-chart/dist/overlays';
import { chartAsReactComponent } from '@density/charts';
import { useAutoWidth } from '../../helpers/use-auto-width';
import useRxStore from '../../helpers/use-rx-store';
import ExploreDataStore from '../../rx-stores/explore-data';
import useRxDispatch from '../../helpers/use-rx-dispatch';


const LineChartComponent = chartAsReactComponent(lineChart);

const CHART_HEIGHT = 350;

export function ExploreSpaceDetailFootTrafficCardRaw ({
  space,

  date,
  timeSegments,
  timeSegmentLabel,
  calculatedData,

  onRefresh,
}) {
  const ref = useRef(null);
  const width = useAutoWidth(ref, 600);

  // Subtract 2 from width and more due to rendering weirdness
  const innerWidth = width - 45;

  const localTimestamp = moment.utc(date).tz(space.timeZone).startOf('day');
  const dayOfWeek = localTimestamp.format('dddd');

  // Find time segment matching this day of the week, or a default
  let timeSegment;
  if (timeSegments) {
    const timeSegmentIndex = timeSegments.findIndex(x => x.days.indexOf(dayOfWeek) > -1);
    timeSegment = timeSegments[timeSegmentIndex] || DEFAULT_TIME_SEGMENT_GROUP.timeSegments[0];
  } else {
    timeSegment = DEFAULT_TIME_SEGMENT_GROUP.timeSegments[0];
  }

  // Get start and end times from the selected time segment
  const {startSeconds, endSeconds} = parseStartAndEndTimesInTimeSegment(timeSegment);
  const startTime = localTimestamp
    .clone()
    .add(startSeconds, 'seconds');
  const endTime = localTimestamp
    .clone()
    .add(endSeconds, 'seconds');

  let chartData: any[] = [],
      min: any = '-',
      max: any = '-';

  if (calculatedData.data) {
    chartData = calculatedData.data.map(i => ({
      timestamp: i.timestamp,
      value: i.interval.analytics.max,
    })).filter(i => {
      const timestampValue = moment.utc(i.timestamp).valueOf();
      return (
        // Remove all timestamps that fall off the left edge of the chart.
        timestampValue >= startTime.valueOf() &&
        // Remove all timestamps that fall off the right edge of the chart.
        timestampValue < endTime.valueOf()
      )
    }).sort((a, b) => {
      if (b) {
        return moment.utc(a.timestamp).valueOf() - moment.utc(b.timestamp).valueOf();
      } else {
        return 0;
      }
    });

    const isToday = (
      moment.utc(date).tz(space.timeZone).format('YYYY-MM-DD') ===
      moment.utc().tz(space.timeZone).format('YYYY-MM-DD')
    );

    // Add a final point at the end of the chart that aligns with the right side of the chart.
    // This ensures that if a few minutes of data are filtered out because the bucket would
    // overflow the right side that the chart is still "filled out" up until the right side.
    //
    // In addition, don't attempt to "fill in" data for the current day, as it hasn't happened
    // yet!
    if (chartData.length > 0 && !isToday) {
      chartData.push({
        timestamp: endTime,
        value: chartData[chartData.length-1].value,
      });
    }

    min = Math.min.apply(Math, calculatedData.data.map(i => i.interval.analytics.min));
    max = Math.max.apply(Math, calculatedData.data.map(i => i.interval.analytics.max));
  }

  if (space) {
    const largestCount = calculatedData.state === 'COMPLETE' && calculatedData.data ? (
      calculatedData.data.reduce((acc, i) => i.count > acc.count ? i : acc, {count: -1})
    ) : null;

    const numberOfTicks = innerWidth >= 640 ? 12 : 6
    const dayDuration = Math.abs(startTime.diff(endTime, 'seconds')) + 1;

    const yAxisPoints: {value: number, hasShadow: boolean, hasRule?: boolean}[] = [];
    if (space.capacity) {
      yAxisPoints.push({value: space.capacity, hasShadow: false, hasRule: true});
    }

    return (
      <div ref={ref}>
      <Card className={styles.exploreSpaceDetailCard}>
        { calculatedData.state === 'LOADING' ? <CardLoading indeterminate /> : null }
        <CardHeader className={styles.exploreSpaceDetailFootTrafficCardHeader}>
          Foot Traffic
          <InfoPopup horizontalIconOffset={8}>
            <p className={styles.exploreSpaceDetailFootTrafficCardPopupP}>
              Count over time on <strong>{moment.utc(date).tz(space.timeZone).format('MMMM D, YYYY')}</strong>{' '}
              during the time segment <strong>{timeSegmentLabel}</strong>,{' '}
              queried in 5 minute intervals.
            </p>

            <p className={styles.exploreSpaceDetailFootTrafficCardPopupP}>
              Use this chart to understand visitation over the course of a day.
            </p>
          </InfoPopup>
          <span
            className={classnames(styles.exploreSpaceDetailFootTrafficCardHeaderRefresh, {
              disabled: calculatedData.state !== 'COMPLETE',
            })}
            onClick={() => onRefresh(space)}
          >
            <Icons.Refresh color={calculatedData.state === 'LOADING' ? 'gray' : 'primary'} />
          </span>
        </CardHeader>

        <div className={styles.exploreSpaceDetailFootTrafficCardWell}>
          <div className={classnames(styles.exploreSpaceDetailFootTrafficCardWellSection, styles.capacity)}>
            <span className={styles.exploreSpaceDetailFootTrafficCardWellSectionQuantity}>{space.capacity || '-'}</span>
            <span className={styles.exploreSpaceDetailFootTrafficCardWellSectionLabel}>Capacity</span>
          </div>
          <div className={classnames(styles.exploreSpaceDetailFootTrafficCardWellSection, styles.minimum)}>
            <span className={styles.exploreSpaceDetailFootTrafficCardWellSectionQuantity}>{min}</span>
            <span className={styles.exploreSpaceDetailFootTrafficCardWellSectionLabel}>Minimum</span>
          </div>
          <div className={classnames(styles.exploreSpaceDetailFootTrafficCardWellSection, styles.maximum)}>
            <span className={styles.exploreSpaceDetailFootTrafficCardWellSectionQuantity}>{max}</span>
            <span className={styles.exploreSpaceDetailFootTrafficCardWellSectionLabel}>Maximum</span>
          </div>
        </div>

        <CardBody className={styles.exploreSpaceDetailFootTrafficCardBody}>
          {calculatedData.state === 'COMPLETE' && chartData.length > 0 ? <LineChartComponent
            timeZone={space.timeZone}
            svgWidth={innerWidth}
            svgHeight={CHART_HEIGHT}

            xAxisStart={startTime}
            xAxisEnd={endTime}
            xAxis={xAxisDailyTick({
              // Number of milliseconds on chart divided by number of ticks
              tickResolutionInMs: 1000 * dayDuration / numberOfTicks,
              formatter: (n) => {
                // "5a" or "8p"
                const timeFormat = parseISOTimeAtSpace(n, space).format('hA');
                return timeFormat.slice(0, timeFormat.startsWith('12') ? -1 : -2).toLowerCase();
              },
            })}

            yAxisStart={0}
            yAxisEnd={space.capacity !== null ?  Math.max(space.capacity, largestCount.count) : undefined}
            yAxis={yAxisMinMax({
              leftOffset: 20,
              verticalBaselineOffset: 10,
              points: yAxisPoints,
              showMaximumPoint: false,
            })}

            overlays={[
              overlayTwoPopups({
                topPopupFormatter: overlayTwoPopupsPersonIconTextFormatter(item => `${item.value}`),
                bottomPopupFormatter: overlayTwoPopupsPlainTextFormatter(
                  (item, {mouseX, xScale}) => {
                    const timestamp = moment.utc(xScale.invert(mouseX)).tz(space.timeZone);
                    const time = timestamp.format(`h:mma`).slice(0, -1);
                    const date = timestamp.format(`ddd MMM Do`);
                    return `${time} ${date}`;
                  }
                ),

                bottomOverlayTopMargin: 40,
                topOverlayBottomMargin: 20,

                topOverlayWidth: 80,
                topOverlayHeight: 42,
                bottomOverlayWidth: 200,
                bottomOverlayHeight: 42,
              }),
            ]}

            data={[
              {
                name: 'default',
                type: dataWaterline,
                verticalBaselineOffset: 10,
                // BUG: chart can't render a single datapoint.
                data: chartData.length === 1 ? [...chartData, ...chartData] : chartData,
              },
            ]}
          /> : null}

        {calculatedData.state === 'COMPLETE' && chartData.length === 0 ? <div className={styles.exploreSpaceDetailFootTrafficCardBodyInfo}>
          <span>No data found for this query.</span>
        </div> : null}
        {calculatedData.state === 'COMPLETE' && !chartData ? <div className={styles.exploreSpaceDetailFootTrafficCardBodyInfo}>
          <span>No data found in date range.</span>
        </div> : null}

        {calculatedData.state === 'LOADING' ? <div className={styles.exploreSpaceDetailFootTrafficCardBodyInfo}>
          <span>Generating Data&nbsp;.&nbsp;.&nbsp;.</span>
        </div> : null}
        {calculatedData.state === 'ERROR' ? <div className={styles.exploreSpaceDetailFootTrafficCardBodyInfo}>
          <span>
            <span className={styles.exploreSpaceDetailFootTrafficCardBodyErrorIcon}>&#xe91a;</span>
            {calculatedData.error.toString()}
          </span>
        </div> : null}
      </CardBody>
    </Card>
    </div>
  );
  } else {
    return <span>This space doesn't exist.</span>;
  }
}

// FIXME: the other props come from somewhere...
const ConnectedExploreSpaceDetailFootTrafficCard: React.FC<Any<FixInRefactor>> = (externalProps) => {

  const dispatch = useRxDispatch();
  const exploreData = useRxStore(ExploreDataStore);

  const calculatedData = exploreData.calculations.footTraffic;

  const onRefresh = async (space) => {
    await calculateFootTraffic(dispatch, space)
  }

  return (
    <ExploreSpaceDetailFootTrafficCardRaw
      {...externalProps}
      calculatedData={calculatedData}
      onRefresh={onRefresh}
    />
  )
}
export default ConnectedExploreSpaceDetailFootTrafficCard;
