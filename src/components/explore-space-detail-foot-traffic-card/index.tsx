import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import moment from 'moment';
import 'moment-timezone';

import Card, { CardHeader, CardBody, CardLoading } from '@density/ui-card';
import { IconRefresh } from '@density/ui-icons';
import InfoPopup from '@density/ui-info-popup';

import {
  DEFAULT_TIME_SEGMENT_GROUP,
  parseStartAndEndTimesInTimeSegment,
} from '../../helpers/time-segments/index';
import { parseISOTimeAtSpace } from '../../helpers/space-time-utilities/index';

import { calculateFootTraffic } from '../../actions/route-transition/explore-space-daily';

import lineChart, { dataWaterline } from '@density/chart-line-chart';
import { xAxisDailyTick, yAxisMinMax } from '@density/chart-line-chart/dist/axes';
import {
  overlayTwoPopups,
  overlayTwoPopupsPersonIconTextFormatter,
  overlayTwoPopupsPlainTextFormatter,
} from '@density/chart-line-chart/dist/overlays';
import { chartAsReactComponent } from '@density/charts';
const LineChartComponent = chartAsReactComponent(lineChart);

const CHART_HEIGHT = 350;

export class ExploreSpaceDetailFootTrafficCard extends React.Component<any, any> {
  render() {
    const {
      space,

      date,
      timeSegments,
      timeSegmentGroup,
      calculatedData,
      chartWidth,

      onRefresh,
    } = this.props;

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

      const numberOfTicks = chartWidth >= 640 ? 12 : 6
      const dayDuration = Math.abs(startTime.diff(endTime, 'seconds')) + 1;

      const yAxisPoints: {value: number, hasShadow: boolean, hasRule?: boolean}[] = [];
      if (space.capacity) {
        yAxisPoints.push({value: space.capacity, hasShadow: false, hasRule: true});
      }

      return (
        <Card className="explore-space-detail-card">
          { calculatedData.state === 'LOADING' ? <CardLoading indeterminate /> : null }
          <CardHeader className="explore-space-detail-foot-traffic-card-header">
            Foot Traffic
            <InfoPopup horizontalIconOffset={8}>
              <p className="explore-space-detail-foot-traffic-card-popup-p">
                Count over time on <strong>{moment.utc(date).tz(space.timeZone).format('MMMM D, YYYY')}</strong>{' '}
                during the time segment <strong>{timeSegmentGroup.name}</strong>,{' '}
                queried in 5 minute intervals.
              </p>

              <p className="explore-space-detail-foot-traffic-card-popup-p">
                Use this chart to understand visitation over the course of a day.
              </p>
            </InfoPopup>
            <span
              className={classnames('explore-space-detail-foot-traffic-card-header-refresh', {
                disabled: calculatedData.state !== 'COMPLETE',
              })}
              onClick={() => onRefresh(space)}
            >
              <IconRefresh color={calculatedData.state === 'LOADING' ? 'gray' : 'primary'} />
            </span>
          </CardHeader>

          <div className="explore-space-detail-foot-traffic-card-well">
            <div className="explore-space-detail-foot-traffic-card-well-section capacity">
              <span className="explore-space-detail-foot-traffic-card-well-section-quantity">{space.capacity || '-'}</span>
              <span className="explore-space-detail-foot-traffic-card-well-section-label">Capacity</span>
            </div>
            <div className="explore-space-detail-foot-traffic-card-well-section minimum">
              <span className="explore-space-detail-foot-traffic-card-well-section-quantity">{min}</span>
              <span className="explore-space-detail-foot-traffic-card-well-section-label">Minimum</span>
            </div>
            <div className="explore-space-detail-foot-traffic-card-well-section maximum">
              <span className="explore-space-detail-foot-traffic-card-well-section-quantity">{max}</span>
              <span className="explore-space-detail-foot-traffic-card-well-section-label">Maximum</span>
            </div>
          </div>

          <CardBody className="explore-space-detail-foot-traffic-card-body">
            {calculatedData.state === 'COMPLETE' && chartData.length > 0 ? <LineChartComponent
              timeZone={space.timeZone}
              svgWidth={chartWidth}
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

          {calculatedData.state === 'COMPLETE' && chartData.length === 0 ? <div className="explore-space-detail-foot-traffic-card-body-info">
            <span>No data found for this query.</span>
          </div> : null}
          {calculatedData.state === 'COMPLETE' && !chartData ? <div className="explore-space-detail-foot-traffic-card-body-info">
            <span>No data found in date range.</span>
          </div> : null}

          {calculatedData.state === 'LOADING' ? <div className="explore-space-detail-foot-traffic-card-body-info">
            <span>Generating Data&nbsp;.&nbsp;.&nbsp;.</span>
          </div> : null}
          {calculatedData.state === 'ERROR' ? <div className="explore-space-detail-foot-traffic-card-body-info">
            <span>
              <span className="explore-space-detail-foot-traffic-card-body-error-icon">&#xe91a;</span>
              {calculatedData.error.toString()}
            </span>
          </div> : null}
        </CardBody>
      </Card>
    );
    } else {
      return <span>This space doesn't exist.</span>;
    }
  }
}

export default connect((state: any) => ({
  calculatedData: state.exploreData.calculations.footTraffic,
}), dispatch => ({
  onRefresh(space) {
    dispatch<any>(calculateFootTraffic(space));
  },
}))(ExploreSpaceDetailFootTrafficCard);
