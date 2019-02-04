import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import moment from 'moment';
import 'moment-timezone';

import {
  parseISOTimeAtSpace,
  prettyPrintHoursMinutes,
  getDurationBetweenMomentsInDays,
  parseDayAtSpace,
} from '../../helpers/space-time-utilities/index';

import { calculateUtilization } from '../../actions/route-transition/explore-space-trends';

import Card, { CardHeader, CardBody, CardLoading, CardWell, CardWellHighlight } from '@density/ui-card';
import { IconRefresh } from '@density/ui-icons';
import InfoPopup from '@density/ui-info-popup';

import PercentageBar from '@density/ui-percentage-bar';

import formatPercentage from '../../helpers/format-percentage/index';

import { parseStartAndEndTimesInTimeSegment } from '../../helpers/time-segments/index';

import lineChart, { dataWaterline } from '@density/chart-line-chart';
import { xAxisDailyTick, yAxisMinMax } from '@density/chart-line-chart/dist/axes';
import {
  overlayTwoPopups,
  overlayTwoPopupsPlainTextFormatter,
} from '@density/chart-line-chart/dist/overlays';

import { chartAsReactComponent } from '@density/charts';
const LineChartComponent = chartAsReactComponent(lineChart);

const AVERAGE_WEEKLY_BREAKDOWN_PERCENTAGE_BAR_BREAK_WIDTH_IN_PX = 320;

const DAY_TO_INDEX_IN_UTILIZAITIONS_BY_DAY = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
};

export const LOADING = 'LOADING',
             EMPTY = 'EMPTY',
             VISIBLE = 'VISIBLE',
             REQUIRES_CAPACITY = 'REQUIRES_CAPACITY',
             ERROR = 'ERROR';

export class ExploreSpaceDetailUtilizationCard extends React.Component<any, any> {
  calculateAverageUtilization(data=this.props.calculatedData.data.utilizations) {
    // No data exists, so render a '-' instead of actual data.
    if (data.length === 0) {
      return null;
    }

    const utilizationSum = data.reduce((acc, i) => acc + i.averageUtilization, 0);
    const result = utilizationSum / data.length;
    return Math.round(result * 100) / 100; /* round to the nearest percentage */
  }

  render() {
    const {
      calculatedData,
      chartWidth,

      space,
      startDate,
      endDate,
      timeSegment,
      timeSegmentGroup,

      onRefresh,
    } = this.props;

    let utilizationsByDay,
      averageUtilizationDatapoints,
      peakUtilizationPercentage,
      peakUtilizationTimestamp,
      averageUtilizationDatapointsWithTimestamp;

    const {startSeconds, endSeconds} = parseStartAndEndTimesInTimeSegment(timeSegment);
    const timeSegmentDurationInSeconds = endSeconds - startSeconds;

    if (calculatedData.state === 'COMPLETE' && !calculatedData.data.requiresCapacity) {
      //

      // Calculate the average utilization for each day within the specified time segment.
      utilizationsByDay = calculatedData.data.utilizations.reduce((acc, i) => {
        const dayOfWeek = parseDayAtSpace(i.date, space).day();
        acc[dayOfWeek].push(i);
        return acc;
      }, [[], [], [], [], [], [], []]);


      // Calculate an average day's utilization graph.
      averageUtilizationDatapoints = (calculatedData.data.utilizations[0] ? calculatedData.data.utilizations[0].utilization : []).map(_ => 0);

      // The average calculation is split into two parts: the sum and the division.
      // - The sum part of the average (step 1) occurs below.
      // - `dataPointCount` contains the number of samples that have been summed together and is the
      // number that will be divided by later to complete the average.
      let dataPointCount = 0;
      calculatedData.data.utilizations.forEach(group => {
        if (Array.isArray(group.utilization)) {
          averageUtilizationDatapoints = averageUtilizationDatapoints.map(
            (i, ct) => i + (group.utilization[ct] || 0) /* ensure that a utilization bucket has data */
          )
          dataPointCount += 1;
        }
      });

      const initialTimestampRaw = calculatedData.data.counts.length > 0 ? calculatedData.data.counts[0].timestamp : startDate;
      const initialTimestamp = parseISOTimeAtSpace(initialTimestampRaw, space)
        .startOf('day')
        .add(startSeconds, 'seconds');

      averageUtilizationDatapointsWithTimestamp = averageUtilizationDatapoints
        .map(i => i / dataPointCount) /* second part of calculating average */
        .map(i => Math.round(i * 1000) / 1000) /* round each number to a single decimal place */
        .reduce(({timestamp, data}, i, ct) => {
          // Increment timestamp to get to the next sample's timestamp.
          timestamp = timestamp.add(timeSegmentDurationInSeconds / averageUtilizationDatapoints.length, 'seconds')

          return {
            timestamp,
            data: [
              ...data,
              { timestamp: timestamp.format(), value: i * 100 },
            ],
          };
        }, {timestamp: initialTimestamp, data: []}).data;

      // Calculate the peak utilization of the space by getting the peak count within the raw count
      // data that was fetched and dividing it by the capacity.
      peakUtilizationPercentage = 0;
      peakUtilizationTimestamp = null; /* No peak utilization */
      averageUtilizationDatapointsWithTimestamp.forEach((c, index) => {
        if (c.value > peakUtilizationPercentage) {
          peakUtilizationPercentage = c.value;
          peakUtilizationTimestamp = c.timestamp;
        }
      });
      peakUtilizationPercentage /= 100;
    }

    const averageWeekHeader = (
      <CardHeader>
        An Average Week
        <InfoPopup horizontalIconOffset={8}>
          <p className="explore-space-detail-utilization-card-popup-p">
            Utilization for time segment <strong>{timeSegmentGroup.name}</strong> from{' '}
            <strong>{parseISOTimeAtSpace(startDate, space).format('MMMM D, YYYY')}</strong> to{' '}
            <strong>{parseISOTimeAtSpace(endDate, space).format('MMMM D, YYYY')}</strong>{' '}
            grouped and averaged by day of week.
          </p>

          <p className="explore-space-detail-utilization-card-popup-p">
            Use this metric to understand your space's average utilization, as well as how
            utilization varies from day to day. 
          </p>

          <p className="explore-space-detail-utilization-card-popup-p">
            Utilization is calculated by dividing occupancy by the total space capacity (with 
            a granularity of 10 minute intervals). Does not include incomplete days of data.
          </p>
        </InfoPopup>
        <span
          className={classnames('explore-space-detail-utilization-card-header-refresh', {
            disabled: calculatedData.state !== 'COMPLETE',
          })}
          onClick={() => onRefresh(space)}
        >
          <IconRefresh color={calculatedData.state === 'LOADING' ? 'gray' : 'primary'} />
        </span>
      </CardHeader>
    );

    const averageDayHeader = (
      <CardHeader>
        An Average Day
        <InfoPopup horizontalIconOffset={8}>
          <p className="explore-space-detail-utilization-card-popup-p">
            An average daily breakdown of utilization for
            time segment <strong>{timeSegmentGroup.name}</strong> from{' '}
            <strong>{parseISOTimeAtSpace(startDate, space).format('MMMM D, YYYY')}</strong> to{' '}
            <strong>{parseISOTimeAtSpace(endDate, space).format('MMMM D, YYYY')}</strong>.
          </p>

          <p className="explore-space-detail-utilization-card-popup-p">
            Use this to understand average peak and trends in utilization over the course of a
            day. 
          </p>

          <p className="explore-space-detail-utilization-card-popup-p">
            Utilization is calculated by dividing occupancy by the total space capacity (with a
            granularity of 10 minute intervals). Utilization is then averaged across all days
            within the date range. Does not include incomplete days of data.
          </p>
        </InfoPopup>
        <span
          className={classnames('explore-space-detail-utilization-card-header-refresh', {
            disabled: calculatedData.state !== 'COMPLETE',
          })}
          onClick={() => onRefresh(space)}
        >
          <IconRefresh color={calculatedData.state === 'LOADING' ? 'gray' : 'primary'} />
        </span>
      </CardHeader>
    );

    let body;
    switch (true) {
      case calculatedData.state === 'LOADING':
        body = (
          <span>
            {(() => {
              if (getDurationBetweenMomentsInDays(startDate, endDate) > 14) {
                return 'Generating Data (this may take a while ... )'
              } else {
                return 'Generating Data . . .';
              }
            })()}
          </span>
        );

        return (
          <div>
            <Card className="explore-space-detail-utilization-card-average-week">
              <CardLoading indeterminate />
              {averageWeekHeader}
              <div className="explore-space-detail-utilization-card-body-info" style={{height: 514}}>
                {body}
              </div>
            </Card>
            <Card className="explore-space-detail-utilization-card-average-day">
              <CardLoading indeterminate />
              {averageDayHeader}
              <div className="explore-space-detail-utilization-card-body-info" style={{height: 624}}>
                {body}
              </div>
            </Card>
          </div>
        );

      case calculatedData.state === 'ERROR':
        body = (
          <div className="explore-space-detail-utilization-card-body-info">
            <span>
              <span className="explore-space-detail-utilization-card-body-error-icon">&#xe91a;</span>
              {calculatedData.error}
            </span>
          </div>
        );

        return <div>
          <Card className="explore-space-detail-utilization-card-average-week">
            {averageWeekHeader}
            {body}
          </Card>
          <Card className="explore-space-detail-utilization-card-average-day">
            {averageDayHeader}
            {body}
          </Card>
        </div>;

      case calculatedData.data.requiresCapacity:
        body = (
          <div className="explore-space-detail-utilization-card-body-info">
            <span>No capacity is set for this space. Capacity is required to calculate utilization.</span>
          </div>
        );

        return (
          <div>
            <Card className="explore-space-detail-utilization-card-average-week">
              {averageWeekHeader}
              {body}
            </Card>
            <Card className="explore-space-detail-utilization-card-average-day">
              {averageDayHeader}
              {body}
            </Card>
          </div>
        );

      case calculatedData.data.utilizations.length === 0:
        body = (
          <div className="explore-space-detail-utilization-card-body-info">
            <span>No data found in date range.</span>
          </div>
        );

        return <div>
          <Card className="explore-space-detail-utilization-card-average-week">
            {averageWeekHeader}
            {body}
          </Card>
          <Card className="explore-space-detail-utilization-card-average-day">
            {averageDayHeader}
            {body}
          </Card>
        </div>;

      case calculatedData.state === 'COMPLETE':
        return (
          <div>
            <Card className="explore-space-detail-utilization-card-average-week">
              {averageWeekHeader}
              <CardWell type="dark">
                Average utilization of <CardWellHighlight>
                  {Math.round(this.calculateAverageUtilization() || 0 * 100)}%
                </CardWellHighlight> during <CardWellHighlight>
                  {timeSegmentGroup.name}
                </CardWellHighlight>
              </CardWell>
              <CardBody className="explore-space-detail-utilization-card-average-weekly-breakdown">
                <div className="explore-space-detail-utilization-card-grid-header">
                  <div className="explore-space-detail-utilization-card-grid-item">Day</div>
                  <div className="explore-space-detail-utilization-card-grid-item">Average Utilization</div>
                </div>
                {timeSegment.days.map(day => {
                  const index = DAY_TO_INDEX_IN_UTILIZAITIONS_BY_DAY[day];
                  return <div className="explore-space-detail-utilization-card-grid-row" key={day}>
                    <div className="explore-space-detail-utilization-card-grid-item">{day}</div>
                    <div className="explore-space-detail-utilization-card-grid-item">
                      <PercentageBar
                        percentage={this.calculateAverageUtilization(utilizationsByDay[index])}
                        percentageFormatter={percentage => percentage !== null ? `${formatPercentage(percentage, 0)}%` : null}
                        breakWidth={AVERAGE_WEEKLY_BREAKDOWN_PERCENTAGE_BAR_BREAK_WIDTH_IN_PX}
                      />
                    </div>
                  </div>;
                })}
              </CardBody>
            </Card>
            <Card className="explore-space-detail-utilization-card-average-day">
              {averageDayHeader}
              <CardWell type="dark">
                {peakUtilizationTimestamp === null ? <span>
                  <CardWellHighlight>
                    No peak utilization
                    </CardWellHighlight> during <CardWellHighlight>
                    {timeSegmentGroup.name}
                  </CardWellHighlight>
                  </span> : <span>
                  Most busy around <CardWellHighlight>
                    {(timestamp => {
                      let stamp = parseISOTimeAtSpace(timestamp, space);
                      let minute = '00';
                      const stampMinute = stamp.minute();

                      if (stampMinute > (45 + 7.5)) {
                        minute = '00';
                        stamp = stamp.add(1, 'hour');
                      } else if (stampMinute > (45 - 7.5) && stampMinute <= (45 + 7.5)) {
                        minute = '45';
                      } else if (stampMinute > (30 - 7.5) && stampMinute <= (30 + 7.5)) {
                        minute = '30';
                      } else if (stampMinute > (15 - 7.5) && stampMinute <= (15 + 7.5)) {
                        minute = '15';
                      } else {
                        minute = '30';
                      }

                      return stamp.format(`h:[${minute}]a`).slice(0, -1);
                    })(peakUtilizationTimestamp)}
                  </CardWellHighlight> &mdash; around <CardWellHighlight>
                    {Math.round(peakUtilizationPercentage * space.capacity)} people
                  </CardWellHighlight> ({Math.round(peakUtilizationPercentage * 100)}% utilization)
                </span>}
              </CardWell>

              <div className="explore-space-detail-utilization-card-daily-breakdown-chart">
                <LineChartComponent
                  timeZone={space.timeZone}
                  svgWidth={chartWidth}
                  svgHeight={350}

                  xAxis={xAxisDailyTick({
                    formatter: (n) => {
                      // "5a" or "8p"
                      const timeFormat = parseISOTimeAtSpace(n, space).format('hA');
                      return timeFormat.slice(0, timeFormat.startsWith('12') ? -1 : -2).toLowerCase();
                    },
                  })}

                  yAxis={yAxisMinMax({
                    leftOffset: 10,
                    points: [
                      {value: 100, hasRule: true},
                    ],
                    showMaximumPoint: false,
                    formatter: ({value}) => value === 100 ? '100%' : `${value}`,
                  })}
                  yAxisStart={0}

                  // The largest point on the y axis should either be:
                  // 1. The largest point on the graph, if larger than 100. (+ 10% in spacing)
                  // 2. 100.
                  yAxisEnd={Math.max(
                    Math.max.apply(Math, averageUtilizationDatapointsWithTimestamp.map(i => i.value))+10, /* 1 */
                    100 /* 2 */
                  )}

                  overlays={[
                    overlayTwoPopups({
                      topPopupFormatter: overlayTwoPopupsPlainTextFormatter(item => `Utilization: ${Math.round(item.value)}%`, 'top'),
                      bottomPopupFormatter: overlayTwoPopupsPlainTextFormatter(
                        (item, {mouseX, xScale}) => {
                          const timestamp = parseISOTimeAtSpace(xScale.invert(mouseX), space);
                          const time = prettyPrintHoursMinutes(timestamp);
                          return `Avg. Weekday at ${time}`;
                        }
                      ),

                      bottomOverlayTopMargin: 40,
                      topOverlayBottomMargin: 10,

                      topOverlayWidth: 150,
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
                      data: averageUtilizationDatapointsWithTimestamp.sort(
                        (a, b) => moment.utc(a.timestamp).valueOf() - moment.utc(b.timestamp).valueOf()
                      ),
                    },
                  ]}
                />
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  }
}

export default connect((state: any) => ({
  calculatedData: state.exploreData.calculations.utilization,
}), dispatch => ({
  onRefresh(space) {
    dispatch<any>(calculateUtilization(space));
  },
}))(ExploreSpaceDetailUtilizationCard);
