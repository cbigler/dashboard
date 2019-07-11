import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import {
  getDurationBetweenMomentsInDays,
  formatInISOTime,
  formatInISOTimeAtSpace,
} from '../../helpers/space-time-utilities/index';
import mixpanelTrack from '../../helpers/mixpanel-track/index';

import generateHourlyBreakdownEphemeralReport from '../../helpers/generate-hourly-breakdown-ephemeral-report/index';

import styles from './styles.module.scss';

import Report from '@density/reports';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  Button,
  Card,
  CardHeader,
  CardLoading,
} from '@density/ui';

export const LOADING = 'LOADING',
             EMPTY = 'EMPTY',
             VISIBLE = 'VISIBLE',
             REQUIRES_CAPACITY = 'REQUIRES_CAPACITY',
             ERROR = 'ERROR';

export function HourlyBreakdownCardRaw({
  space,
  startDate,
  endDate,
  hourlyBreakdownVisits,
  hourlyBreakdownPeaks,
  metric,
  title,
  aggregation,
  onDownloadCSV,
}: any) {

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

      return (
        <div>
          <AppBarContext.Provider value="TRANSPARENT">
            <AppBar padding="0">
              <AppBarSection />
              <AppBarSection>
                <Button
                  onClick={() => onDownloadCSV(space, metric, startDate, endDate, hourlyBreakdown.data.data)}
                  disabled={hourlyBreakdown.state !== 'COMPLETE'}
                >Download CSV</Button>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
          <div className={styles.exploreSpaceDetailHourlyBreakdownContainer}>
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
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default connect((state: any) => ({
  hourlyBreakdownVisits: state.exploreData.calculations.hourlyBreakdownVisits,
  hourlyBreakdownPeaks: state.exploreData.calculations.hourlyBreakdownPeaks,
  spaces: state.spaces
}), dispatch => ({
  onDownloadCSV: (space, metric, startDate, endDate, data) => {
    mixpanelTrack('Hourly Breakdown Export', {
      space_id: space.id,
      start_time: startDate,
      end_time: endDate,
    });

    const currentTime = moment(startDate);
    const csvData = data.reduce((curr, next) => {
      curr += next.values.map(value => {
        const line = `${formatInISOTime(currentTime)},${formatInISOTimeAtSpace(currentTime, space)},${value}\n`;
        currentTime.add(1, 'hour');
        return line;
      }).join('');
      return curr;
    }, `Timestamp,Local Time,${metric === 'PEAKS' ? 'Peak' : 'Visits'}\n`)

    // This is a workaround to allow a user to download this csv data, or if that doesn't work,
    // then at least open it in a new tab for them to view and copy to the clipboard.
    // 1. Create a new blob url.
    // 2a. Redirect the user to it in a new tab.
    // 2b. Except on IE where we use a .msSaveBlob() function
    const fileName = `${space.id}_${startDate}_${endDate}.csv`;
    const dataBlob = new Blob([csvData], {type: 'text/csv;charset=utf8;'});

    if (navigator && navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(dataBlob, fileName);
    } else {
      const dataURL = URL.createObjectURL(dataBlob);
      const tempLink = document.createElement('a');
      document.body.appendChild(tempLink);
      tempLink.href = dataURL;
      tempLink.setAttribute('download', fileName);
      tempLink.click();
      document.body.removeChild(tempLink);
    }
  }
}))(React.memo(HourlyBreakdownCardRaw));
