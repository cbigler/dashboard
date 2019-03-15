import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import {
  getDurationBetweenMomentsInDays,
} from '../../helpers/space-time-utilities/index';

import generateHourlyBreakdownEphemeralReport from '../../helpers/generate-hourly-breakdown-ephemeral-report/index';

import Report from '@density/reports';

import {
  Card,
  CardHeader,
  CardLoading,
} from '@density/ui';

export const LOADING = 'LOADING',
             EMPTY = 'EMPTY',
             VISIBLE = 'VISIBLE',
             REQUIRES_CAPACITY = 'REQUIRES_CAPACITY',
             ERROR = 'ERROR';

export class HourlyBreakdownCard extends React.Component<any, any> {
  render() {
    const {
      space,
      startDate,
      endDate,
      hourlyBreakdownVisits,
      hourlyBreakdownPeaks,
      metric,
      title,
      aggregation,
    } = this.props;

    let hourlyBreakdown = hourlyBreakdownVisits;
    if(metric === "PEAKS") {
      hourlyBreakdown = hourlyBreakdownPeaks;
    }

    let body;
    switch (true) {
      case hourlyBreakdown.state === 'LOADING':
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
          <Card className="explore-space-detail-hourly-breakdown-card">
            <CardLoading indeterminate />
            <CardHeader>
              {title}
            </CardHeader>
            <div className="explore-space-detail-hourly-breakdown-card-body-info" style={{height: 739}}>
              {body}
            </div>
          </Card>
        );

      case hourlyBreakdown.state === 'ERROR':
        body = (
          <div className="explore-space-detail-hourly-breakdown-card-body-error">
            <span>
              <span className="explore-space-detail-hourly-breakdown-card-body-error-icon">&#xe91a;</span>
                {hourlyBreakdown.error.response.data.detail}
            </span>
          </div>
        );

        return <Card className="explore-space-detail-hourly-breakdown-card">
            {body}
          </Card>;

      case hourlyBreakdown.state === 'COMPLETE':

        // Force this one to be scrollable
        hourlyBreakdown.data.scrollable = true;

        return (<div className="explore-space-detail-hourly-breakdown-container">
          <Report
            report={generateHourlyBreakdownEphemeralReport(
              space,
              startDate,
              endDate,
              metric,
              title,
              aggregation
            )}
            reportData={{
              state: hourlyBreakdown.state,
              data: hourlyBreakdown.data,
              error: hourlyBreakdown.error,
            }}
            expanded={true}
          />
        </div>);

      default:
        return null;
    }
  }
}

export default connect((state: any) => ({
  hourlyBreakdownVisits: state.exploreData.calculations.hourlyBreakdownVisits,
  hourlyBreakdownPeaks: state.exploreData.calculations.hourlyBreakdownPeaks,
  spaces: state.spaces
}), dispatch => ({
}))(HourlyBreakdownCard);
