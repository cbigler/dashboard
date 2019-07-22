import React, { useState } from 'react';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  DatePicker,
  DateRangePicker,
} from '@density/ui';
import gridVariables from '@density/ui/variables/grid.json';

import { isInclusivelyBeforeDay } from '@density/react-dates';

import { DensitySpace } from '../../types';
import Report from '../report';
import {
  parseISOTimeAtSpace,
  parseFromReactDates,
  formatInISOTime,
  formatForReactDates,
  getCurrentLocalTimeAtSpace,
} from '../../helpers/space-time-utilities';
import { connect } from 'react-redux';
import isOutsideRange, { MAXIMUM_DAY_LENGTH } from '../../helpers/date-range-picker-is-outside-range';
import getCommonRangesForSpace from '../../helpers/common-ranges';

// When the user selects a start date, select a range that's this long. THe user can stil ladjust
// the range up to a maximum length of `MAXIMUM_DAY_LENGTH` though.
const INITIAL_RANGE_SELECTION = MAXIMUM_DAY_LENGTH / 2;

type ReportControllerProps = {
  space: DensitySpace;
  title: string;
  controls: Array<{
    label: string,
    value: any,
    type: 'date' | 'date_range' | 'time_segment'
  }>;
  reports: Array<{
    component: any,
    data: any
  }>;
}

function SpacesReportDatePicker({
  date,
  space,
  onChange,
}) {
  const [focused, setFocused] = useState(false);
  return <DatePicker
    anchor="ANCHOR_RIGHT"
    date={formatForReactDates(parseISOTimeAtSpace(date, space), space)}
    onChange={date => onChange(space, formatInISOTime(parseFromReactDates(date, space)))}
    focused={focused}
    onFocusChange={event => setFocused(event.focused)}
    arrowRightDisabled={
      parseISOTimeAtSpace(date, space).format('MM/DD/YYYY') ===
      getCurrentLocalTimeAtSpace(space).format('MM/DD/YYYY')
    }
    isOutsideRange={day => !isInclusivelyBeforeDay(
      day,
      getCurrentLocalTimeAtSpace(space).startOf('day'),
    )}
  />;
}

function SpacesReportDateRangePicker({
  startDate,
  endDate,
  space,
  onChange,
}) {
  const [focused, setFocused] = useState(false);
  return <DateRangePicker
    startDate={formatForReactDates(parseISOTimeAtSpace(startDate, space), space)}
    endDate={formatForReactDates(parseISOTimeAtSpace(endDate, space), space)}
    onChange={({start, end}) => {
      start = start ?
        parseFromReactDates(start, space).startOf('day') :
        parseISOTimeAtSpace(startDate, space);
      end = end ?
        parseFromReactDates(end, space).endOf('day') :
        parseISOTimeAtSpace(endDate, space)

      // If the user selected over 14 days, then clamp them back to 14 days.
      if (startDate && endDate && endDate.diff(startDate, 'days') > MAXIMUM_DAY_LENGTH) {
        endDate = startDate.clone().add(INITIAL_RANGE_SELECTION-1, 'days');
      }

      // Only update the start and end data if at least one of them has changed
      if (formatInISOTime(start) !== startDate || formatInISOTime(end) !== endDate) {
        onChange(formatInISOTime(start), formatInISOTime(end));
      }
    }}
    focusedInput={focused}
    onFocusChange={event => setFocused(event.focused)}
    numberOfMonths={document.body && document.body.clientWidth > gridVariables.screenSmMin ? 2 : 1}
    isOutsideRange={day => isOutsideRange(space, day)}

    commonRanges={getCommonRangesForSpace(space)}
    onSelectCommonRange={({start, end}) => onChange(formatInISOTime(start), formatInISOTime(end))}
  />;
}

export function SpacesReportController({
  space,
  title,
  controls,
  reports
}: ReportControllerProps) {
  const [state, setState] = useState({
    datePickerFocused: false,
  });

  return (
    <div>
      <AppBarContext.Provider value="TRANSPARENT">
        <AppBar>
          <AppBarSection>{title}</AppBarSection>
          <AppBarSection>
            {controls.map(control => {
              switch(control.type) {
                case 'date':
                  return <SpacesReportDatePicker
                    space={space}
                    key={control.label}
                    date={control.value}
                    onChange={value => alert(value)}
                  />;
                case 'date_range':
                  return <SpacesReportDateRangePicker
                    space={space}
                    key={control.label}
                    startDate={control.value.start}
                    endDate={control.value.end}
                    onChange={value => alert(value)}
                  />;
              }
            })}
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
      {reports.map(report => {
        return <div>Report</div>;
      })}
    </div>
  );
}

export default React.memo(SpacesReportController);

// export default connect(() => ({}), dispatch => {
//   return {
//     onChangeSpaceFilter(key, value) {
//       dispatch(collectionSpacesFilter(key, value));
//     },
//     onChangeDate(activePage, space, value) {
//       dispatch(collectionSpacesFilter('date', value));
//       dispatch(collectionSpacesFilter('dailyRawEventsPage', 1));
//       if (activePage === 'EXPLORE_SPACE_DAILY') {
//         dispatch<any>(calculateDailyModules(space));
//       }
//     },
//     onChangeTimeSegmentLabel(activePage, space, spaceFilters, value) {
//       dispatch(collectionSpacesFilter('timeSegmentLabel', value));
//       dispatch(collectionSpacesFilter('dailyRawEventsPage', 1));
//       if (activePage === 'EXPLORE_SPACE_TRENDS') {
//         dispatch<any>(calculateTrendsModules(space, spaceFilters));
//       } else if (activePage === 'EXPLORE_SPACE_DAILY') {
//         dispatch<any>(calculateDailyModules(space));
//       }
//     },
//     onChangeDateRange(activePage, space, spaceFilters, startDate, endDate) {
//       dispatch(collectionSpacesFilter('startDate', startDate));
//       dispatch(collectionSpacesFilter('endDate', endDate));
//       if (activePage === 'EXPLORE_SPACE_TRENDS') {
//         dispatch<any>(calculateTrendsModules(space, spaceFilters));
//       } else if (activePage === 'EXPLORE_SPACE_MEETINGS') {
//         dispatch<any>(calculateMeetingsModules(space.id));
//       }
//     },
//   };
// })(React.memo(ExploreReportController));
