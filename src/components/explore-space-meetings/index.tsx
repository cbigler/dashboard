import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { isInclusivelyBeforeDay, isInclusivelyAfterDay } from '@density/react-dates';
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

import {
  integrationsRobinSpacesSelect,
  integrationsSpaceMappingUpdate,
} from '../../actions/integrations/robin';
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
  exploreData,
  integrations,

  onChangeSpaceMapping,
  onChangeSpaceFilter,
  onChangeDateRange,
}) {
  if (space) {
    const roomBookingDefaultService = integrations.roomBooking.defaultService;
    const isIntegrationSpaceSelected = (
      roomBookingDefaultService && // A room booking service was defined
      exploreData.robinSpaces.selected // Space mapping selected
    );

    return (
      <Fragment>
        <Toaster />

        {spaces.filters.startDate && spaces.filters.endDate ? (
          <AppBar>
            <AppBarSection>
              {isIntegrationSpaceSelected ? (
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
                      onChangeDateRange(space, formatInISOTime(startDate), formatInISOTime(endDate), spaces.filters);
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
                      {...spaces.filters, startDate, endDate}
                    );
                  }}
                />
              ) : null}
            </AppBarSection>
            <AppBarSection>
              <img
                className="explore-space-meetings-robin-image"
                src={RobinImage}
              />
              {exploreData.robinSpaces.view === 'VISIBLE' ? (
                <InputBox
                  type="select"
                  placeholder="Select a space from Robin"
                  width={275}
                  menuMaxHeight={500}
                  value={exploreData.robinSpaces.selected}
                  choices={
                    flattenRobinSpaces(exploreData.robinSpaces.data as Array<DensityRobinSpace>)
                      .map(robinSpace => ({
                        id: robinSpace.id,
                        label: robinSpace.name,
                      }))
                  }
                  onChange={robinSpaceChoice => onChangeSpaceMapping(space.id, robinSpaceChoice.id)}
                />
              ) : null}
              {exploreData.robinSpaces.view === 'LOADING' ? (
                <span>Loading</span>
              ) : null}
              {exploreData.robinSpaces.view === 'ERROR' ? (
                <span>Error loading robin spaces</span>
              ) : null}
            </AppBarSection>
          </AppBar>
        ) : null}

        {exploreData.robinSpaces.view === 'VISIBLE' && integrations.roomBooking.view === 'VISIBLE' ? (
          <Fragment>
            {/* Room booking integration has not been configured */}
            {true || !roomBookingDefaultService ? (
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
            {false && roomBookingDefaultService && !exploreData.robinSpaces.selected ? (
              <div className="explore-space-meetings-centered-message">
                <div className="explore-space-meetings-integration-cta">
                  Link a Robin space to this Density space to display your reports.
                </div>
              </div>
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
    exploreData: state.exploreData,
    integrations: state.integrations,
  };
}, dispatch => {
  return {
    onChangeSpaceFilter(space, key, value) {
      dispatch(collectionSpacesFilter(key, value));
    },
    onChangeDateRange(space, startDate, endDate, spaceFilters) {
      dispatch(collectionSpacesFilter('startDate', startDate));
      dispatch(collectionSpacesFilter('endDate', endDate));
      // dispatch<any>(calculateTrendsModules(space, spaceFilters));
    },
    onChangeSpaceMapping(spaceId, robinSpaceId) {
      dispatch<any>(integrationsSpaceMappingUpdate(spaceId, robinSpaceId));
    },
  };
})(ExploreSpaceMeetings);
