import React from 'react';
import { connect } from 'react-redux';

import {
  getDurationBetweenMomentsInDays,
} from '../../helpers/space-time-utilities/index';

import generateHourlyBreakdownEphemeralReport from '../../helpers/generate-hourly-breakdown-ephemeral-report/index';

import styles from './styles.module.scss';

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
          <Card className={styles.exploreSpaceDetailHourlyBreakdownCard}>
            <CardLoading indeterminate />
            <CardHeader>
              {title}
            </CardHeader>
            <div className={styles.exploreSpaceDetailHourlyBreakdownCardBodyInfo} style={{height: 739}}>
              {body}
            </div>
          </Card>
        );

      case hourlyBreakdown.state === 'ERROR':
        body = (
          <div className={styles.exploreSpaceDetailHourlyBreakdownCardBodyError}>
            <span>
              <span className={styles.exploreSpaceDetailHourlyBreakdownCardBodyErrorIcon}>&#xe91a;</span>
                {hourlyBreakdown.error}
            </span>
          </div>
        );

        return <Card className={styles.exploreSpaceDetailHourlyBreakdownCard}>
            {body}
          </Card>;

      case hourlyBreakdown.state === 'COMPLETE':

        // Force this one to be scrollable
        hourlyBreakdown.data.scrollable = true;

        return (<div className={styles.exploreSpaceDetailHourlyBreakdownContainer}>
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
