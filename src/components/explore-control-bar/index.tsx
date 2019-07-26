import styles from './styles.module.scss';

import React from 'react';
import { connect } from 'react-redux';

import gridVariables from '@density/ui/variables/grid.json';

import {
  AppBar,
  AppBarSection,
  DatePicker,
  DateRangePicker,
  InputBox,
} from '@density/ui';

import { isInclusivelyBeforeDay } from '@density/react-dates';

import { formatForReactDates, parseISOTimeAtSpace, formatInISOTime, parseFromReactDates, getCurrentLocalTimeAtSpace, prettyPrintHoursMinutes } from '../../helpers/space-time-utilities';

import collectionSpacesFilter from '../../actions/collection/spaces/filter';
import { calculate as calculateDailyModules } from '../../actions/route-transition/explore-space-daily';
import { calculate as calculateTrendsModules } from '../../actions/route-transition/explore-space-trends';
import { calculate as calculateMeetingsModules } from '../../actions/route-transition/explore-space-meetings';
import { parseStartAndEndTimesInTimeSegment, getShownTimeSegmentsForSpace, DEFAULT_TIME_SEGMENT_LABEL } from '../../helpers/time-segments';
import isOutsideRange from '../../helpers/date-range-picker-is-outside-range';
import getCommonRangesForSpace from '../../helpers/common-ranges';

// When the user selects a start date, select a range that's this long. The user can stil ladjust
// the range up to a maximum length of 92 though
const MAXIMUM_DAY_LENGTH = 92;
const INITIAL_RANGE_SELECTION = MAXIMUM_DAY_LENGTH / 2;

export function ExploreControlBarRaw({
  selectedSpace,
  spaceHierarchy,
  activePage,
  filters,
  onChangeDate,
  onChangeDateRange,
  onChangeSpaceFilter,
  onChangeTimeSegmentLabel,
}) {
  if (selectedSpace) {
    const shownTimeSegments = getShownTimeSegmentsForSpace(selectedSpace, spaceHierarchy.data);
    const spaceTimeSegmentLabelsArray = [
      DEFAULT_TIME_SEGMENT_LABEL,
      ...shownTimeSegments.map(i => i.label),
    ];

    // Which time segment label was selected?
    const selectedTimeSegmentLabel = filters.timeSegmentLabel;

    return (
      <AppBar>
        <AppBarSection>
          {activePage === 'SPACES_SPACE_DAILY' ? <div className={styles.exploreControlDatePicker}>
            <DatePicker
              date={formatForReactDates(parseISOTimeAtSpace(filters.date, selectedSpace), selectedSpace)}
              onChange={date => onChangeDate(activePage, selectedSpace, formatInISOTime(parseFromReactDates(date, selectedSpace)))}

              focused={filters.datePickerFocused}
              onFocusChange={({focused}) => onChangeSpaceFilter('datePickerFocused', focused)}
              arrowRightDisabled={
                parseISOTimeAtSpace(filters.date, selectedSpace).format('MM/DD/YYYY') ===
                getCurrentLocalTimeAtSpace(selectedSpace).format('MM/DD/YYYY')
              }

              isOutsideRange={day => !isInclusivelyBeforeDay(
                day,
                getCurrentLocalTimeAtSpace(selectedSpace).startOf('day'),
              )}
            />
          </div> : null}
          {['SPACES_SPACE_DATA_EXPORT', 'SPACES_SPACE_MEETINGS'].indexOf(activePage) === -1 ? <div className={styles.exploreControlTimeSegment}>
              <InputBox
              type="select"
              className={styles.exploreSpaceDailyTimeSegmentBox}
              value={selectedTimeSegmentLabel}
              choices={spaceTimeSegmentLabelsArray
                // Remove multiple entries from the list if a time segment shows up multiple times
                .filter((label, index) => spaceTimeSegmentLabelsArray.indexOf(label) === index)
                .map(label => {
                  const applicableTimeSegmentsForLabel = shownTimeSegments.filter(i => i.label === label);
                  if (applicableTimeSegmentsForLabel.length === 1) {
                    const timeSegment = applicableTimeSegmentsForLabel[0];
                    const {startSeconds, endSeconds} = parseStartAndEndTimesInTimeSegment(timeSegment);
                    return {
                      id: label,
                      label: `${label} (${prettyPrintHoursMinutes(
                        getCurrentLocalTimeAtSpace(selectedSpace)
                          .startOf('day')
                          .add(startSeconds, 'seconds')
                      )} - ${prettyPrintHoursMinutes(
                        getCurrentLocalTimeAtSpace(selectedSpace)
                          .startOf('day')
                          .add(endSeconds, 'seconds')
                      )})`,
                    };
                  } else if (label === DEFAULT_TIME_SEGMENT_LABEL) {
                    return { id: label, label: 'Whole day (12:00a - 11:59p)' }
                  } else {
                    return {
                      id: label,
                      label: `${label} (mixed hours)`
                    };
                  }
                })
              }
              width={280}

              onChange={value => onChangeTimeSegmentLabel(activePage, selectedSpace, filters, value.id)}
            />
          </div> : null}
          {(activePage !== 'SPACES_SPACE_DAILY' && filters.startDate && filters.endDate) ? <div className={styles.exploreControlDateRangePicker}>
            <DateRangePicker
              startDate={formatForReactDates(
                parseISOTimeAtSpace(filters.startDate, selectedSpace),
                selectedSpace,
              )}
              endDate={formatForReactDates(
                parseISOTimeAtSpace(filters.endDate, selectedSpace),
                selectedSpace,
              )}
              onChange={({startDate, endDate}) => {
                if (startDate) {
                  startDate = parseFromReactDates(startDate, selectedSpace).startOf('day');
                } else {
                  startDate = parseISOTimeAtSpace(filters.startDate, selectedSpace);
                }
                if (endDate) {
                  endDate = parseFromReactDates(endDate, selectedSpace).endOf('day');
                } else {
                  endDate = parseISOTimeAtSpace(filters.endDate, selectedSpace);
                }

                // If the user selected over 14 days, then clamp them back to 14 days.
                if (startDate && endDate && endDate.diff(startDate, 'days') > MAXIMUM_DAY_LENGTH) {
                  endDate = startDate.clone().add(INITIAL_RANGE_SELECTION-1, 'days');
                }

                // Only update the start and end data if one of them has changed from its previous
                // value
                if (
                  formatInISOTime(startDate) !== filters.startDate || 
                  formatInISOTime(endDate) !== filters.endDate
                ) {
                  onChangeDateRange(activePage, selectedSpace, filters, formatInISOTime(startDate), formatInISOTime(endDate));
                }
              }}
              // Within the component, store if the user has selected the start of end date picker
              // input
              focusedInput={filters.datePickerInput}
              onFocusChange={(focused, a) => {
                onChangeSpaceFilter('datePickerInput', focused);
              }}

              // On mobile, make the calendar one month wide and left aligned.
              // On desktop, the calendar is two months wide and right aligned.
              numberOfMonths={document.body && document.body.clientWidth > gridVariables.screenSmMin ? 2 : 1}

              isOutsideRange={day => isOutsideRange(selectedSpace, day)}

              // common ranges functionality
              commonRanges={getCommonRangesForSpace(selectedSpace)}
              onSelectCommonRange={({startDate, endDate}) => {
                onChangeDateRange(
                  activePage,
                  selectedSpace,
                  {...filters, startDate, endDate},
                  formatInISOTime(startDate),
                  formatInISOTime(endDate),
                );
              }}
            />
          </div> : null}

        </AppBarSection>
      </AppBar>
    );
  } else {
    return null;
  }
}


export default connect(() => ({}), dispatch => {
  return {
    onChangeSpaceFilter(key, value) {
      dispatch(collectionSpacesFilter('dailyRawEventsPage', 1));
      dispatch(collectionSpacesFilter(key, value));
    },
    onChangeDate(activePage, space, value) {
      dispatch(collectionSpacesFilter('date', value));
      dispatch(collectionSpacesFilter('dailyRawEventsPage', 1));
      if (activePage === 'SPACES_SPACE_DAILY') {
        dispatch<any>(calculateDailyModules(space));
      }
    },
    onChangeTimeSegmentLabel(activePage, space, spaceFilters, value) {
      dispatch(collectionSpacesFilter('timeSegmentLabel', value));
      dispatch(collectionSpacesFilter('dailyRawEventsPage', 1));
      if (activePage === 'SPACES_SPACE_TRENDS') {
        dispatch<any>(calculateTrendsModules(space, spaceFilters));
      } else if (activePage === 'SPACES_SPACE_DAILY') {
        dispatch<any>(calculateDailyModules(space));
      }
    },
    onChangeDateRange(activePage, space, spaceFilters, startDate, endDate) {
      dispatch(collectionSpacesFilter('startDate', startDate));
      dispatch(collectionSpacesFilter('endDate', endDate));
      if (activePage === 'SPACES_SPACE_TRENDS') {
        dispatch<any>(calculateTrendsModules(space, spaceFilters));
      } else if (activePage === 'SPACES_SPACE_MEETINGS') {
        dispatch<any>(calculateMeetingsModules(space.id))
      }
    },
  };
})(React.memo(ExploreControlBarRaw));
