import styles from './styles.module.scss';

import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import moment from 'moment';
import 'moment-timezone';

import { calculateDailyMetrics } from '../../actions/route-transition/explore-space-trends';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import { isInclusivelyBeforeDay, isInclusivelyAfterDay } from '@density/react-dates';

import {
  Card,
  CardBody,
  CardHeader,
  CardLoading,
  Icons,
  InputBox,
  InfoPopup,
} from '@density/ui';

import dailyMetrics from '@density/chart-daily-metrics';
import lineChart, { dataWaterline } from '@density/chart-line-chart';
import { xAxisDailyTick, yAxisMinMax } from '@density/chart-line-chart/dist/axes';
import {
  overlayTwoPopups,
  overlayTwoPopupsPlainTextFormatter,
} from '@density/chart-line-chart/dist/overlays';

import {
  parseISOTimeAtSpace,
  getDurationBetweenMomentsInDays,
} from '../../helpers/space-time-utilities/index';

import { chartAsReactComponent } from '@density/charts';
const DailyMetricsComponent = chartAsReactComponent(dailyMetrics);
const LineChartComponent = chartAsReactComponent(lineChart);

const ONE_MINUTE_IN_MS = 60 * 1000,
      ONE_HOUR_IN_MS = ONE_MINUTE_IN_MS * 60,
      ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 60;

// Below this number of days or equal to this number of days, show the normal daily metrics chart.
// Above this number of days, show the expanded line chart.
const GRAPH_TYPE_TRANSITION_POINT_IN_DAYS = 14;

const CHART_HEIGHT = 350;

export class ExploreSpaceDetailDailyMetricsCard extends Component<any, any> {
  render() {
    const {
      spaces,
      calculatedData,
      chartWidth,

      space,
      startDate,
      endDate,
      timeSegmentLabel,

      onRefresh,
      onChangeMetricToDisplay,
    } = this.props;

    if (space) {
      return (
        <Card>
          {calculatedData.state === 'LOADING' ? <CardLoading indeterminate /> : null }

          <CardHeader className={styles.exploreSpaceDetailDailyMetricsCardHeader}>
            <div className={styles.exploreSpaceDetailDailyMetricsCardTitle}>
              Daily Metrics
              <InfoPopup horizontalIconOffset={8}>
                <p className={styles.exploreSpaceDetailDailyMetricsCardPopupP}>
                  Visitation metrics for time segment <strong>{timeSegmentLabel}</strong> from{' '}
                  <strong>{parseISOTimeAtSpace(startDate, space).format('MMMM D, YYYY')}</strong> to{' '}
                  <strong>{parseISOTimeAtSpace(endDate, space).format('MMMM D, YYYY')}</strong>{' '}
                  grouped by day.
                </p>

                <p className={styles.exploreSpaceDetailDailyMetricsCardPopupP}>
                  Use these metrics to understand the visitation of your space, and how it trends
                  over time.
                </p>

                <ul className={styles.exploreSpaceDetailDailyMetricsCardPopupUl}>
                  <li>
                    <strong>Entrances</strong>: Total number of events from people entering the space.
                  </li>
                  <li>
                    <strong>Exits</strong>: Total number of events from people exiting the space.
                  </li>
                  <li>
                    <strong>Peak Occupancy</strong>: Peak count at any point in time during the day.
                  </li>
                </ul>
              </InfoPopup>
            </div>
            <div className={styles.exploreSpaceDetailDailyMetricsCardMetricPicker}>
              <InputBox
                type="select"
                value={spaces.filters.metricToDisplay}
                disabled={calculatedData.state !== 'COMPLETE'}
                onChange={e => onChangeMetricToDisplay(space, e.id)}
                choices={[
                  {id: "entrances", label: "Entrances"},
                  {id: "exits", label: "Exits"},
                  {id: "total-events", label: "Total Events"},
                  {id: "peak-occupancy", label: "Peak Occupancy"},
                ]}
              />
            </div>
            <span
              className={classnames(styles.exploreSpaceDetailDailyMetricsCardRefresh, styles.end, {
                [styles.disabled]: calculatedData.state !== 'COMPLETE',
              })}
              onClick={() => onRefresh(space)}
            >
              <Icons.Refresh color={calculatedData.state === 'LOADING' ? 'gray' : 'primary'} />
            </span>
          </CardHeader>

          <CardBody className={styles.exploreSpaceDetailDailyMetricsCardBody}>
            {calculatedData.state === 'COMPLETE' ? (() => {
              if (calculatedData.data.metrics.length > GRAPH_TYPE_TRANSITION_POINT_IN_DAYS) {
                const data: any[] = calculatedData.data.metrics.slice().sort(
                  (a, b) => moment.utc(a.timestamp).valueOf() - moment.utc(b.timestamp).valueOf()
                );
                data.push({
                  timestamp: moment(data[data.length - 1].timestamp).add(1, 'day'),
                  value: data[data.length - 1].value
                })
                // For more than two weeks of data, show the graph chart.
                return <div className={styles.largeTimespanChart}>
                  <LineChartComponent
                    timeZone={space.timeZone}
                    svgWidth={chartWidth}
                    svgHeight={370}

                    xAxis={xAxisDailyTick({
                      // Calculate a tick resolutino that makes sense given the selected time range.
                      tickResolutionInMs: (() => {
                        const durationDays = getDurationBetweenMomentsInDays(startDate, endDate);
                        if (durationDays > 30) {
                          return 3 * ONE_DAY_IN_MS;
                        } else if (durationDays > 14) {
                          return 1 * ONE_DAY_IN_MS;
                        } else {
                          return 0.5 * ONE_DAY_IN_MS;
                        }
                      })(),
                      formatter: n => parseISOTimeAtSpace(n, space).format(`MM/DD`),
                    })}

                    yAxis={yAxisMinMax({})}
                    yAxisStart={0}

                    overlays={[
                      overlayTwoPopups({
                        topPopupFormatter: overlayTwoPopupsPlainTextFormatter(item => {
                          const unit = (function(metric) {
                            switch (metric) {
                              case 'entrances': return 'Entrances';
                              case 'exits': return 'Exits';
                              case 'total-events': return 'Total Events';
                              case 'peak-occupancy': return 'Peak Occupancy';
                              default: return 'People';
                            }
                          })(spaces.filters.metricToDisplay);
                          return `${Math.round(item.value)} ${unit}`;
                        }, 'top'),
                        bottomPopupFormatter: overlayTwoPopupsPlainTextFormatter(
                          (item, {mouseX, xScale}) => {
                            const timestamp = parseISOTimeAtSpace(xScale.invert(mouseX), space);
                            return timestamp.format(`ddd MMM DD YYYY`);
                          }
                        ),

                        bottomOverlayTopMargin: 40,
                        topOverlayBottomMargin: 20,

                        topOverlayWidth: spaces.filters.metricToDisplay === 'peak-occupancy' ? 180 : 150,
                        topOverlayHeight: 42,
                        bottomOverlayWidth: 150,
                        bottomOverlayHeight: 42,
                      }),
                    ]}

                    data={[
                      {
                        name: 'default',
                        type: dataWaterline,
                        verticalBaselineOffset: 10,
                        data,
                      },
                    ]}
                  />
                </div>;
              } else {
                // Less than two weeks should stil use the daily metrics chart.
                return <div className={styles.shortTimespanChart}>
                  <DailyMetricsComponent
                    data={calculatedData.data.metrics.map(i => {
                      return {
                        // Remove the offset that was added when the data was fetched.
                        label: parseISOTimeAtSpace(i.timestamp, space).format('MM/DD'),
                        value: i.value,
                      };
                    })}
                    width={chartWidth}
                    height={CHART_HEIGHT}
                  />
                </div>;
              }
            })() : null}

            {calculatedData.state === 'ERROR' ? <div className={styles.exploreSpaceDetailDailyMetricsCardBodyError}>
              <span>
                <span className={styles.exploreSpaceDetailDailyMetricsCardBodyErrorIcon}>&#xe91a;</span>
                {calculatedData.error.toString()}
              </span>
            </div> : null }

            {calculatedData.state === 'COMPLETE' && calculatedData.data.metrics === null ? <div className={styles.exploreSpaceDetailDailyMetricsCardBodyInfo}>
              No data available for this time range.
            </div> : null }

            {calculatedData.state === 'LOADING' ? <div className={styles.exploreSpaceDetailDailyMetricsCardBodyInfo}>
              Generating Data&nbsp;.&nbsp;.&nbsp;.
            </div> : null }
          </CardBody>
        </Card>
      );
    } else {
      return null;
    }
  }
}

export default connect((state: any) => ({
  spaces: state.spaces,
  calculatedData: state.exploreData.calculations.dailyMetrics,
}), dispatch => ({
  onRefresh(space) {
    dispatch<any>(calculateDailyMetrics(space));
  },
  onChangeMetricToDisplay(space, metric) {
    dispatch(collectionSpacesFilter('metricToDisplay', metric));
    dispatch<any>(calculateDailyMetrics(space));
  }
}))(ExploreSpaceDetailDailyMetricsCard);
