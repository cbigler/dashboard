import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Report, { ReportLoading } from '@density/reports';

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
import Toaster from '../toaster';
import GenericErrorState from '../generic-error-state/index';

import { integrationsRobinSpacesSelect } from '../../actions/integrations/robin';
import { integrationsSpaceMappingUpdate } from '../../actions/integrations/room-booking';
import { calculate } from '../../actions/route-transition/explore-space-meetings';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import getCommonRangesForSpace from '../../helpers/common-ranges';
import { DensitySpaceMapping, DensityRobinSpace } from '../../types';

// The maximum number of days that can be selected by the date range picker
const MAXIMUM_DAY_LENGTH = 3 * 31; // Three months of data

// When the user selects a start date, select a range that's this long. THe user can stil ladjust
// the range up to a maximum length of `MAXIMUM_DAY_LENGTH` though.
const INITIAL_RANGE_SELECTION = MAXIMUM_DAY_LENGTH / 2;

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

function flattenRobinSpaces(robinSpaces) {
  if (!robinSpaces) {
    return [];
  } else {
    return [
      ...robinSpaces,
      ...robinSpaces.map(robinSpace => flattenRobinSpaces(robinSpace.children)).flat(),
    ];
  }
}

function ExploreSpaceMeetings({
  spaces,
  space,
  integrations,
  exploreDataMeetings,

  onChangeSpaceMapping,
  onChangeSpaceFilter,
  onChangeDateRange,
  onReload,
}) {
  if (space) {
    const roomBookingDefaultService = integrations.roomBooking.defaultService;
    const roomBookingSpaceMapping = integrations.roomBooking.spaceMappingForActiveSpace;
    const isIntegrationSpaceSelected = (
      roomBookingDefaultService && // A room booking service was defined
      integrations.roomBooking.spaceMappingForActiveSpace
    );

    return (
      <Fragment>
        <Toaster />

        {spaces.filters.startDate && spaces.filters.endDate && roomBookingDefaultService ? (
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

                    isOutsideRange={day => isOutsideRange(
                      spaces.filters.startDate,
                      spaces.filters.datePickerInput,
                      day
                    )}

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
                    className="explore-space-meetings-refresh-button"
                    onClick={() => onReload(space.id)}
                  >
                    <Icons.Refresh color={colorVariables.brandPrimary} />
                  </span>
                </Fragment>
              ) : null}
            </AppBarSection>
            <AppBarSection>
              <img
                className="explore-space-meetings-robin-image"
                src={RobinImage}
              />
              {integrations.robinSpaces.view === 'VISIBLE' ? (
                <InputBox
                  type="select"
                  placeholder="Select a space from Robin"
                  width={275}
                  menuMaxHeight={500}
                  value={roomBookingSpaceMapping ? roomBookingSpaceMapping.serviceSpaceId : null}
                  choices={
                    flattenRobinSpaces(integrations.robinSpaces.data as Array<DensityRobinSpace>)
                      .map(robinSpace => ({
                        id: robinSpace.id.toString(),
                        label: robinSpace.name,
                      }))
                  }
                  onChange={robinSpaceChoice => onChangeSpaceMapping(roomBookingDefaultService, space.id, robinSpaceChoice.id)}
                />
              ) : null}
            </AppBarSection>
          </AppBar>
        ) : null}

        {integrations.roomBooking.view === 'LOADING' ? (
          <div className="explore-space-meetings-centered-message">
            <div className="explore-space-meetings-integration-cta">
              Loading integration data...
            </div>
          </div>
        ) : null}

        {integrations.robinSpaces.view === 'ERROR' || integrations.roomBooking.view === 'ERROR' ? (
          <div className="explore-space-meetings-centered-message">
            <GenericErrorState />
          </div>
        ) : null}

        {integrations.roomBooking.view === 'VISIBLE' ? (
          <Fragment>
            {/* Room booking integration has not been configured */}
            {!roomBookingDefaultService ? (
              <div className="explore-space-meetings-centered-message">
                <div className="explore-space-meetings-integration-cta">
                  <div className="explore-space-meetings-integration-cta-label">
                    <div className="explore-space-meetings-integration-density-wrapper">
                      <DensityMark size={30} color="#fff" />
                    </div>
                    <Icons.Link />
                    <div className="explore-space-meetings-integration-integration-wrapper">
                      <img
                        className="explore-space-meetings-robin-image"
                        src={RobinImage}
                      />
                    </div>

                    Setup an integration with Robin to get started.
                  </div>

                  <Button
                    type="primary"
                    onClick={e => { window.location.href = '#/admin/integrations'; }}
                  >Integrate</Button>
                </div>
              </div>
            ) : null}
            {/* Room booking integration has been configured, but aa space maaping has not been set up */}
            {integrations.robinSpaces.view === 'VISIBLE' && roomBookingDefaultService && !roomBookingSpaceMapping ? (
              <div className="explore-space-meetings-centered-message">
                <div className="explore-space-meetings-integration-cta">
                  Link a {roomBookingDefaultService.displayName} space to this Density space to display your reports.
                </div>
              </div>
            ) : null}

            {roomBookingDefaultService && roomBookingSpaceMapping ? (
              <Fragment>
                {exploreDataMeetings.state === 'LOADING' ? (
                  <div className="explore-space-meetings-centered-message">
                    <div className="explore-space-meetings-integration-cta">
                      Loading {roomBookingDefaultService.displayName} data and rendering reports...
                    </div>
                  </div>
                ) : null}
                {/* There is nothing that sets this data into an error state, so that case is omitted */}
                {exploreDataMeetings.state === 'COMPLETE' ? (() => {
                  const meetingAttendanceReport = exploreDataMeetings.data.find(i => i.report.name === 'Meeting Attendance');
                  const bookingBehaviorReport = exploreDataMeetings.data.find(i => i.report.name === 'Booker Behavior');
                  const meetingSizeReport = exploreDataMeetings.data.find(i => i.report.name === 'Meeting Size');
                  const dayToDayMeetingsReport = exploreDataMeetings.data.find(i => i.report.name === 'Meetings: Day-to-Day');
                  return (
                    <div className="explore-space-meetings-report-grid">
                      <div className="explore-space-meetings-report-column left">
                        <div className="explore-space-meetings-report-container">
                          <Report
                            key={meetingAttendanceReport.report.id}
                            report={meetingAttendanceReport.report}
                            reportData={{
                              state: meetingAttendanceReport.state,
                              data: meetingAttendanceReport.data,
                            }}
                          />
                        </div>
                        <div className="explore-space-meetings-report-container">
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
                      <div className="explore-space-meetings-report-column right">
                        <div className="explore-space-meetings-report-container">
                          <Report
                            key={meetingSizeReport.report.id}
                            report={meetingSizeReport.report}
                            reportData={{
                              state: meetingSizeReport.state,
                              data: meetingSizeReport.data,
                            }}
                          />
                        </div>
                        <div className="explore-space-meetings-report-container">
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
    async onChangeSpaceMapping(defaultService, spaceId, robinSpaceId) {
      if (!defaultService) {
        throw new Error('Cannot create a space mapping without a default room booking service!');
      }
      await dispatch<any>(integrationsSpaceMappingUpdate(defaultService, spaceId, robinSpaceId));
      dispatch<any>(calculate(spaceId));
    },
    onReload(id) {
      dispatch<any>(calculate(id));
    },
  };
})(ExploreSpaceMeetings);
