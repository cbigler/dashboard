import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import {
  parseISOTimeAtSpace,
  getDurationBetweenMomentsInDays,
} from '../../helpers/space-time-utilities/index';

import generateHourlyBreakdownEphemeralReport from '../../helpers/generate-hourly-breakdown-ephemeral-report/index';

import Report from '@density/reports';
import Card, { CardHeader, CardBody, CardLoading, CardWell, CardWellHighlight } from '@density/ui-card';

export const LOADING = 'LOADING',
             EMPTY = 'EMPTY',
             VISIBLE = 'VISIBLE',
             REQUIRES_CAPACITY = 'REQUIRES_CAPACITY',
             ERROR = 'ERROR';

export class ExploreSpaceDetailHourlyBreakdownCard extends React.Component<any, any> {
  render() {
    const {
      space,
      startDate,
      endDate,
      hourlyBreakdown,
    } = this.props;

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
              Hourly Breakdown
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
              {hourlyBreakdown.error}
            </span>
          </div>
        );

        return <Card className="explore-space-detail-hourly-breakdown-card">
            {body}
          </Card>;

      case hourlyBreakdown.state === 'COMPLETE':
        return (
          <Report
            report={generateHourlyBreakdownEphemeralReport(
              space,
              startDate,
              endDate,
            )}
            reportData={{
              state: hourlyBreakdown.state,
              data: hourlyBreakdown.data,
              error: hourlyBreakdown.error,
            }}
            expanded={true}
          />
        );

      default:
        return null;
    }
  }
}

export default connect((state: any) => ({
  hourlyBreakdown: state.exploreData.calculations.hourlyBreakdown,
  spaces: state.spaces
}), dispatch => ({
}))(ExploreSpaceDetailHourlyBreakdownCard);