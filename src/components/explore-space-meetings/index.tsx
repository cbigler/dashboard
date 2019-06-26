import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import Report from '@density/reports';

import styles from './styles.module.scss';
import classnames from 'classnames';

import {
  Button,
  DensityMark,
  Icons,
} from '@density/ui';

import RobinImage from '../../assets/images/icon-robin.svg';
import Toaster from '../toaster';
import GenericErrorState from '../generic-error-state/index';


export function ExploreSpaceMeetingsRaw({
  space,
  integrations,
  exploreDataMeetings,
}) {
  if (space) {
    const roomBookingService = integrations.roomBooking.service;
    const roomBookingSpaceMapping = space.spaceMappings.length > 0 ? space.spaceMappings[0] : false;

    return (
      <Fragment>
        <Toaster />

        {integrations.roomBooking.view === 'LOADING' ? (
          <div className={styles.centeredMessage}>
            <div className={styles.integrationCta}>
              Loading integration data...
            </div>
          </div>
        ) : null}

        {integrations.roomBooking.view === 'ERROR' ? (
          <div className={styles.centeredMessage}>
            <GenericErrorState />
          </div>
        ) : null}

        {integrations.roomBooking.view === 'VISIBLE' ? (
          <Fragment>
            {/* Room booking integration has not been configured */}
            {!roomBookingService ? (
              <div className={styles.centeredMessage}>
                <div className={styles.integrationCta}>
                  <div className={styles.integrationCtaLabel}>
                    <div className={styles.integrationDensityWrapper}>
                      <DensityMark size={30} color="#fff" />
                    </div>
                    <Icons.Link />
                    <div className={styles.integrationIntegrationWrapper}>
                      <img
                        className={styles.robinImage}
                        src={RobinImage}
                        alt="Robin"
                      />
                    </div>

                    Setup an integration with Robin to get started.
                  </div>

                  <Button variant="filled" href="#/admin/integrations">Integrate</Button>
                </div>
              </div>
            ) : null}
            {/* Room booking integration has been configured, but aa space maaping has not been set up */}
            {roomBookingService && !roomBookingSpaceMapping ? (
              <div className={styles.centeredMessage}>
                <div className={styles.integrationCta}>
                  Link a {roomBookingService.displayName} space to this Density space to display your reports.
                </div>
              </div>
            ) : null}

            {roomBookingService && roomBookingSpaceMapping ? (
              <Fragment>
                {exploreDataMeetings.state === 'LOADING' ? (
                  <div className={styles.centeredMessage}>
                    <div className={styles.integrationCta}>
                      Loading {roomBookingService.displayName} data and rendering reports...
                    </div>
                  </div>
                ) : null}
                {/* There is nothing that sets this data into an error state, so that case is omitted */}
                {exploreDataMeetings.state === 'COMPLETE' ? (() => {
                  const meetingAttendanceReport = exploreDataMeetings.data.find(i => i.report.name === 'Meeting attendance');
                  const bookingBehaviorReport = exploreDataMeetings.data.find(i => i.report.name === 'Booker behavior');
                  const meetingSizeReport = exploreDataMeetings.data.find(i => i.report.name === 'Meeting size');
                  const dayToDayMeetingsReport = exploreDataMeetings.data.find(i => i.report.name === 'Meetings: Day-to-day');
                  return (
                    <div className={styles.reportGrid}>
                      <div className={classnames(styles.reportColumn, styles.left)}>
                        <div className={styles.reportContainer}>
                          <Report
                            key={meetingAttendanceReport.report.id}
                            report={meetingAttendanceReport.report}
                            reportData={{
                              state: meetingAttendanceReport.state,
                              data: meetingAttendanceReport.data,
                            }}
                          />
                        </div>
                        <div className={styles.reportContainer}>
                          <Report
                            key={bookingBehaviorReport.report.id}
                            report={bookingBehaviorReport.report}
                            reportData={{
                              state: bookingBehaviorReport.state,
                              data: bookingBehaviorReport.data,
                            }}
                          />
                        </div>
                      </div>
                      <div className={classnames(styles.reportColumn, styles.right)}>
                        <div className={styles.reportContainer}>
                          <Report
                            key={meetingSizeReport.report.id}
                            report={meetingSizeReport.report}
                            reportData={{
                              state: meetingSizeReport.state,
                              data: meetingSizeReport.data,
                            }}
                          />
                        </div>
                        <div className={styles.reportContainer}>
                          <Report
                            key={dayToDayMeetingsReport.report.id}
                            report={dayToDayMeetingsReport.report}
                            reportData={{
                              state: dayToDayMeetingsReport.state,
                              data: dayToDayMeetingsReport.data,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })() : null}
              </Fragment>
            ) : null}
          </Fragment>
        ) : null}
      </Fragment>
    );
  } else {
    return null;
  }
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    space: state.spaces.data.find(space => space.id === state.spaces.selected),
    exploreDataMeetings: state.exploreData.calculations.meetings,
    integrations: state.integrations,
  };
})(React.memo(ExploreSpaceMeetingsRaw));
