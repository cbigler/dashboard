import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

import RobinImage from '../../assets/images/icon-robin.svg';

import { isInclusivelyBeforeDay, isInclusivelyAfterDay } from '@density/react-dates';
import gridVariables from '@density/ui/variables/grid.json'
import {
  DateRangePicker,
  InputBox,
  AppBar,
  AppBarSection,
} from '@density/ui';

import { calculate as calculateTrendsModules } from '../../actions/route-transition/explore-space-trends';

import {
  getCurrentLocalTimeAtSpace,
  parseISOTimeAtSpace,
  parseFromReactDates,
  formatInISOTime,
  formatForReactDates,
  prettyPrintHoursMinutes,
} from '../../helpers/space-time-utilities/index';

import ExploreFilterBar, { ExploreFilterBarItem } from '../explore-filter-bar/index';
import ExploreSpaceHeader from '../explore-space-header/index';
import UtilizationCard from '../explore-space-detail-utilization-card/index';
import ErrorBar from '../error-bar/index';

import DailyMetricsCard from '../explore-space-detail-daily-metrics-card/index';
import HourlyBreakdownCard from '../explore-space-detail-hourly-breakdown-card/index';


import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import getCommonRangesForSpace from '../../helpers/common-ranges';
import isMultiWeekSelection from '../../helpers/multi-week-selection/index';
import {
  DEFAULT_TIME_SEGMENT_GROUP,
  findTimeSegmentsInTimeSegmentGroupForSpace,
  parseStartAndEndTimesInTimeSegment,
} from '../../helpers/time-segments/index';

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

function ExploreSpaceMeetings({
  spaces,
  space,
  onChangeSpaceFilter,
  onChangeDateRange,
}) {
  if (space) {
    return <div>
      {spaces.filters.startDate && spaces.filters.endDate ? (
        <AppBar>
          <AppBarSection>
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
          </AppBarSection>
          <AppBarSection>
            <img className="explore-space-meetings-robin-image" src={RobinImage} />
            <InputBox
              type="select"
              placeholder="Select a space from Robin"
              width={275}
              choices={[
                {id: 'foo', label: 'foo'},
                {id: 'bar', label: 'bar'},
              ]}
            />
          </AppBarSection>
        </AppBar>
      ) : null}

      foo
    </div>;
  } else {
    return null;
  }
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    space: state.spaces.data.find(space => space.id === state.spaces.selected),
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
  };
})(ExploreSpaceMeetings);
