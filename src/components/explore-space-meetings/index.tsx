import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Report, { ReportLoading } from '@density/reports';

import styles from './styles.module.scss';
import classnames from 'classnames';

import { isInclusivelyBeforeDay, isInclusivelyAfterDay } from '@density/react-dates';
import colorVariables from '@density/ui/variables/colors.json'
import gridVariables from '@density/ui/variables/grid.json'
import {
  Button,
  DateRangePicker,
  InputBox,
  AppBar,
  AppBarSection,
  DensityMark,
  Icons,
} from '@density/ui';

import {
  parseISOTimeAtSpace,
  parseFromReactDates,
  formatInISOTime,
  formatForReactDates,
} from '../../helpers/space-time-utilities/index';

import RobinImage from '../../assets/images/icon-robin.svg';
import TeemImage from '../../assets/images/icon-teem.svg';
import GoogleCalendarImage from '../../assets/images/icon-google-calendar.svg';
import Toaster from '../toaster';
import GenericErrorState from '../generic-error-state/index';

import { integrationsSpaceMappingUpdate } from '../../actions/integrations/room-booking';
import { calculate } from '../../actions/route-transition/explore-space-meetings';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import getCommonRangesForSpace from '../../helpers/common-ranges';
import { DensitySpaceMapping, DensityServiceSpace } from '../../types';

import isOutsideRange, {
  MAXIMUM_DAY_LENGTH,
} from '../../helpers/date-range-picker-is-outside-range/index';

// When the user selects a start date, select a range that's this long. THe user can stil ladjust
// the range up to a maximum length of `MAXIMUM_DAY_LENGTH` though.
const INITIAL_RANGE_SELECTION = MAXIMUM_DAY_LENGTH / 2;


function ExploreSpaceMeetings({
  spaces,
  space,
  integrations,
  exploreDataMeetings,

  onChangeSpaceFilter,
  onChangeDateRange,
  onReload,
}) {
  if (space) {
    const roomBookingService = integrations.roomBooking.service;
    const roomBookingSpaceMapping = space.spaceMappings.length > 0 ? space.spaceMappings[0] : false;
    const isIntegrationSpaceSelected = (
      roomBookingService && // A room booking service was defined
      roomBookingSpaceMapping
    );

    return (
      <Fragment>
        <Toaster />

        {spaces.filters.startDate && spaces.filters.endDate && roomBookingService ? (
          <AppBar>
            <AppBarSection>
              {isIntegrationSpaceSelected ? (
                <Fragment>
                  <DateRangePicker
                    startDate={formatForReactDates(
                      parseISOTimeAtSpace(spaces.filters.startDate, space),
                      space,
                    )}
                    endDate={formatForReactDates(
                      parseISOTimeAtSpace(spaces.filters.endDate, space),
                      space,
                    )}
                    onChange={({startDate, endDate}) => {
                      startDate = startDate ? parseFromReactDates(startDate, space) : parseISOTimeAtSpace(spaces.filters.startDate, space);
                      endDate = endDate ? parseFromReactDates(endDate, space) : parseISOTimeAtSpace(spaces.filters.endDate, space);

                      // If the user selected over 14 days, then clamp them back to 14 days.
                      if (startDate && endDate && endDate.diff(startDate, 'days') > MAXIMUM_DAY_LENGTH) {
                        endDate = startDate.clone().add(INITIAL_RANGE_SELECTION-1, 'days');
                      }

                      // Only update the start and end data if one of them has changed from its previous
                      // value
                      if (
                        formatInISOTime(startDate) !== spaces.filters.startDate || 
                        formatInISOTime(endDate) !== spaces.filters.endDate
                      ) {
                        onChangeDateRange(space, formatInISOTime(startDate), formatInISOTime(endDate));
                      }
                    }}
                    // Within the component, store if the user has selected the start of end date picker
                    // input
                    focusedInput={spaces.filters.datePickerInput}
                    onFocusChange={(focused, a) => {
                      onChangeSpaceFilter(space, 'datePickerInput', focused);
                    }}

                    // On mobile, make the calendar one month wide and left aligned.
                    // On desktop, the calendar is two months wide and right aligned.
                    numberOfMonths={document.body && document.body.clientWidth > gridVariables.screenSmMin ? 2 : 1}

                    isOutsideRange={day => isOutsideRange(space, day)}

                    // common ranges functionality
                    commonRanges={getCommonRangesForSpace(space)}
                    onSelectCommonRange={({startDate, endDate}) => {
                      onChangeDateRange(
                        space,
                        formatInISOTime(startDate),
                        formatInISOTime(endDate),
                      );
                    }}
                  />
                  <span
                    role="button"
                    className={styles.refreshButton}
                    onClick={() => onReload(space.id)}
                  >
                    <Icons.Refresh color={colorVariables.brandPrimary} />
                  </span>
                </Fragment>
              ) : null}
            </AppBarSection>
            <AppBarSection>
               {/* TODO: Show icon of the service that this space is mapped to */}
            </AppBarSection>
          </AppBar>
        ) : null}

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
}, dispatch => {
  return {
    onChangeSpaceFilter(space, key, value) {
      dispatch(collectionSpacesFilter(key, value));
    },
    onChangeDateRange(space, startDate, endDate) {
      dispatch(collectionSpacesFilter('startDate', startDate));
      dispatch(collectionSpacesFilter('endDate', endDate));
      dispatch<any>(calculate(space.id));
    },
    onReload(id) {
      dispatch<any>(calculate(id));
    },
  };
})(ExploreSpaceMeetings);
