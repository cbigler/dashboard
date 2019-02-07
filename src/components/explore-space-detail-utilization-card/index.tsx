import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import moment from 'moment';
import 'moment-timezone';

import {
  parseISOTimeAtSpace,
  prettyPrintHoursMinutes,
  getDurationBetweenMomentsInDays,
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
  calculateAverageUtilization(data=this.props.calculatedData.data.counts) {
    // No data exists, so render a '-' instead of actual data.
    if (data.length === 0) {
      return null;
    }

    const utilizationSum = data.reduce((acc, i) => acc + i, 0);
    const result = utilizationSum / data.length;
    return Math.round(result * 100) / 10000; /* round to the nearest percentage */
  }

  render() {
    const {
      calculatedData,
      chartWidth,

      space,
      startDate,
      endDate,
      timeSegments,
      timeSegmentGroup,

      onRefresh,
    } = this.props;

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

      case calculatedData.data.counts.length === 0:
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
                  {Math.round(calculatedData.data.averageUtilizationPercentage)}%
                </CardWellHighlight> during <CardWellHighlight>
                  {timeSegmentGroup.name}
                </CardWellHighlight>
              </CardWell>
              <CardBody className="explore-space-detail-utilization-card-average-weekly-breakdown">
                <div className="explore-space-detail-utilization-card-grid-header">
                  <div className="explore-space-detail-utilization-card-grid-item">Day</div>
                  <div className="explore-space-detail-utilization-card-grid-item">Average Utilization</div>
                </div>
                {calculatedData.data.utilizationsByDay.map(x => {
                  return <div className="explore-space-detail-utilization-card-grid-row" key={x.day}>
                    <div className="explore-space-detail-utilization-card-grid-item">{x.day}</div>
                    <div className="explore-space-detail-utilization-card-grid-item">
                      <PercentageBar
                        percentage={x.average / 100}
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
                {calculatedData.data.peakUtilizationTimestamp === null ? <span>
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
                    })(calculatedData.data.peakUtilizationTimestamp)}
                  </CardWellHighlight> &mdash; around <CardWellHighlight>
                    {Math.round(calculatedData.data.peakUtilizationPercentage * space.capacity / 100)} people
                  </CardWellHighlight> ({Math.round(calculatedData.data.peakUtilizationPercentage)}% utilization)
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
                    Math.max.apply(Math, calculatedData.data.utilizationsByTime.map(x => Math.max.apply(Math, x.data)))+10, /* 1 */
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
                      data: calculatedData.data.utilizationsByTime.map(x => {
                        return {
                          timestamp: moment.tz(x.time, 'HH:mm', space.timeZone).valueOf(),
                          value: x.data.reduce((a, n) => a + n) / x.data.length
                        };
                      }),
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
