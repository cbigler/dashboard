import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import moment from 'moment';
import 'moment-timezone';

import { calculateDailyMetrics } from '../../actions/route-transition/explore-space-trends';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import Card, { CardHeader, CardBody, CardLoading } from '@density/ui-card';
import { isInclusivelyBeforeDay, isInclusivelyAfterDay } from '@density/react-dates';
import InputBox from '@density/ui-input-box';
import { IconRefresh } from '@density/ui-icons';
import InfoPopup from '@density/ui-info-popup';

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

// The maximum number of days that can be selected by the date range picker
const MAXIMUM_DAY_LENGTH = 3 * 31; // Three months of data

// Below this number of days or equal to this number of days, show the normal daily metrics chart.
// Above this number of days, show the expanded line chart.
const GRAPH_TYPE_TRANSITION_POINT_IN_DAYS = 14;

const CHART_HEIGHT = 350;

// Given a day on the calendar and the current day, determine if the square on the calendar should
// be grayed out or not.
export function isOutsideRange(startISOTime, datePickerInput, day) {
  const startDate = moment.utc(startISOTime);
  if (day.isAfter(moment.utc())) {
    return true;
  }

  if (datePickerInput === 'endDate') {
    return datePickerInput === 'endDate' && startDate &&
      !( // Is the given `day` within `MAXIMUM_DAY_LENGTH` days from the start date?
        isInclusivelyAfterDay(day, startDate) &&
        isInclusivelyBeforeDay(day, startDate.clone().add(MAXIMUM_DAY_LENGTH - 1, 'days'))
      );
  }
  return false;
}

export class ExploreSpaceDetailDailyMetricsCard extends Component<any, any> {
  render() {
    const {
      spaces,
      calculatedData,
      chartWidth,

      space,
      startDate,
      endDate,
      timeSegmentGroup,

      onRefresh,
      onChangeMetricToDisplay,
    } = this.props;

    if (space) {
      return (
        <Card>
          {calculatedData.state === 'LOADING' ? <CardLoading indeterminate /> : null }

          <CardHeader className="explore-space-detail-daily-metrics-card-header">
            <div className="explore-space-detail-daily-metrics-card-title">
              Daily Metrics
              <InfoPopup horizontalIconOffset={8}>
                <p className="explore-space-detail-daily-metrics-card-popup-p">
                  Visitation metrics for time segment <strong>{timeSegmentGroup.name}</strong> from{' '}
                  <strong>{parseISOTimeAtSpace(startDate, space).format('MMMM D, YYYY')}</strong> to{' '}
                  <strong>{parseISOTimeAtSpace(endDate, space).format('MMMM D, YYYY')}</strong>{' '}
                  grouped by day.
                </p>

                <p className="explore-space-detail-daily-metrics-card-popup-p">
                  Use these metrics to understand the visitation of your space, and how it trends
                  over time.
                </p>

                <ul className="explore-space-detail-daily-metrics-card-popup-ul">
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
              <span
                className={classnames('explore-space-detail-daily-metrics-card-refresh mid', {
                  disabled: calculatedData.state !== 'COMPLETE',
                })}
                onClick={() => onRefresh(space)}
              >
                <IconRefresh color={calculatedData.state === 'LOADING' ? 'gray' : 'primary'} />
              </span>
            </div>
            <div className="explore-space-detail-daily-metrics-card-metric-picker">
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
              className={classnames('explore-space-detail-daily-metrics-card-refresh end', {
                disabled: calculatedData.state !== 'COMPLETE',
              })}
              onClick={() => onRefresh(space)}
            >
              <IconRefresh color={calculatedData.state === 'LOADING' ? 'gray' : 'primary'} />
            </span>
          </CardHeader>

          <CardBody className="explore-space-detail-daily-metrics-card-body">
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
                return <div className="large-timespan-chart">
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
                return <div className="short-timespan-chart">
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

            {calculatedData.state === 'ERROR' ? <div className="explore-space-detail-daily-metrics-card-body-error">
              <span>
                <span className="explore-space-detail-daily-metrics-card-body-error-icon">&#xe91a;</span>
                {calculatedData.error.toString()}
              </span>
            </div> : null }

            {calculatedData.state === 'COMPLETE' && calculatedData.data.metrics === null ? <div className="explore-space-detail-daily-metrics-card-body-info">
              No data available for this time range.
            </div> : null }

            {calculatedData.state === 'LOADING' ? <div className="explore-space-detail-daily-metrics-card-body-info">
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
