import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

import InputBox from '@density/ui-input-box';
import { isInclusivelyBeforeDay, isInclusivelyAfterDay } from '@density/react-dates';
import { calculate as calculateTrendsModules } from '../../actions/route-transition/explore-space-trends';

import {
  getCurrentLocalTimeAtSpace,
  parseISOTimeAtSpace,
  parseFromReactDates,
  formatInISOTime,
  formatForReactDates,
  prettyPrintHoursMinutes,
} from '../../helpers/space-time-utilities/index';

import Subnav, { SubnavItem } from '../subnav/index';
import ExploreFilterBar, { ExploreFilterBarItem } from '../explore-filter-bar/index';
import ExploreSpaceHeader from '../explore-space-header/index';
import UtilizationCard from '../explore-space-detail-utilization-card/index';
import ErrorBar from '../error-bar/index';

import DailyMetricsCard from '../explore-space-detail-daily-metrics-card/index';

import DateRangePicker from '@density/ui-date-range-picker';
import gridVariables from '@density/ui/variables/grid.json'

import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import getCommonRangesForSpace from '../../helpers/common-ranges';
import {
  DEFAULT_TIME_SEGMENT_GROUP,
  findTimeSegmentInTimeSegmentGroupForSpace,
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

function ExploreSpaceTrends({
  spaces,
  space,
  activeModal,
  timeSegmentGroups,
  onChangeSpaceFilter,
  onChangeTimeSegmentGroup,
  onChangeDateRange,
}) {
  if (space) {
    const spaceTimeSegmentGroupArray = [
      DEFAULT_TIME_SEGMENT_GROUP,
      ...timeSegmentGroups.data.filter(tsg => {
        return space.timeSegmentGroups.find(i => i.id === tsg.id);
      })
    ];

    // Which time segment group was selected?
    const selectedTimeSegmentGroup = spaceTimeSegmentGroupArray.find(i => {
      return i.id === spaces.filters.timeSegmentGroupId;
    });

    // And, with the knowlege of the selected space, which time segment within that time segment
    // group is applicable to this space?
    const applicableTimeSegment = findTimeSegmentInTimeSegmentGroupForSpace(
      selectedTimeSegmentGroup,
      space,
    );

    return <div className="explore-space-trends-page">
      <Subnav visible>
        <SubnavItem active href={`#/spaces/explore/${spaces.selected}/trends`}>Trends</SubnavItem>
        <SubnavItem href={`#/spaces/explore/${spaces.selected}/daily`}>Daily</SubnavItem>
        <SubnavItem href={`#/spaces/explore/${spaces.selected}/data-export`}>Data Export</SubnavItem>
      </Subnav>

      {spaces.filters.startDate && spaces.filters.endDate ? (
        <ExploreFilterBar>
          <ExploreFilterBarItem label="Time Segment">
            <InputBox
              type="select"
              className="explore-space-trends-time-segment-box"
              value={selectedTimeSegmentGroup.id}
              choices={spaceTimeSegmentGroupArray.map(ts => {
                const applicableTimeSegmentForGroup = findTimeSegmentInTimeSegmentGroupForSpace(
                  ts,
                  space,
                );
                const {startSeconds, endSeconds} = parseStartAndEndTimesInTimeSegment(applicableTimeSegmentForGroup);
                return {
                  id: ts.id,
                  label: `${ts.name} (${prettyPrintHoursMinutes(
                    getCurrentLocalTimeAtSpace(space)
                      .startOf('day')
                      .add(startSeconds, 'seconds')
                  )} - ${prettyPrintHoursMinutes(
                    getCurrentLocalTimeAtSpace(space)
                      .startOf('day')
                      .add(endSeconds, 'seconds')
                  )})`,
                };
              })}
              width={300}
              onChange={value => onChangeTimeSegmentGroup(space, value.id)}
            />
          </ExploreFilterBarItem>
          <ExploreFilterBarItem label="Date Range">
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
                onChangeDateRange(space, formatInISOTime(startDate), formatInISOTime(endDate));
              }}
            />
          </ExploreFilterBarItem>
        </ExploreFilterBar>
      ) : null}

      <ErrorBar
        message={spaces.error || timeSegmentGroups.error}
        modalOpen={activeModal.name !== null}
      />

      <ExploreSpaceHeader />

      {spaces.filters.startDate && spaces.filters.endDate ? (
        <div className="explore-space-trends-container">
          <div className="explore-space-trends">
            <div className="explore-space-trends-item">
              <UtilizationCard
                space={space}
                startDate={spaces.filters.startDate}
                endDate={spaces.filters.endDate}
                timeSegmentGroup={selectedTimeSegmentGroup}
                timeSegment={applicableTimeSegment}
              />
            </div>
            <div className="explore-space-trends-item">
              <DailyMetricsCard
                space={space}
                startDate={spaces.filters.startDate}
                endDate={spaces.filters.endDate}
                timeSegmentGroup={selectedTimeSegmentGroup}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>;
  } else {
    return <br />;
  }
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    space: state.spaces.data.find(space => space.id === state.spaces.selected),
    activeModal: state.activeModal,
    timeSegmentGroups: state.timeSegmentGroups,
  };
}, dispatch => {
  return {
    onChangeSpaceFilter(space, key, value) {
      dispatch(collectionSpacesFilter(key, value));
    },
    onChangeTimeSegmentGroup(space, value) {
      dispatch(collectionSpacesFilter('timeSegmentGroupId', value));
      dispatch<any>(calculateTrendsModules(space));
    },
    onChangeDateRange(space, startDate, endDate) {
      dispatch(collectionSpacesFilter('startDate', startDate));
      dispatch(collectionSpacesFilter('endDate', endDate));
      dispatch<any>(calculateTrendsModules(space));
    },
  };
})(ExploreSpaceTrends);
