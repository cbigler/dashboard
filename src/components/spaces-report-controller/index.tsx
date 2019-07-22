import React, { useState } from 'react';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  DatePicker,
} from '@density/ui';

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

type ReportControllerProps = {
  space: DensitySpace;
  title: string;
  controls: Array<{
    label: string,
    value: any,
    type: 'date' | 'date_range' | 'time_segment'
  }>;
  reports: any;
}

function SpacesReportDatePicker({
  date,
  space,
  focused,
  onChange,
  onFocusChange,
}) {
  return <DatePicker
    anchor="ANCHOR_RIGHT"
    date={formatForReactDates(parseISOTimeAtSpace(date, space), space)}
    onChange={date => onChange(space, formatInISOTime(parseFromReactDates(date, space)))}
    focused={focused}
    onFocusChange={onFocusChange} //({focused}) => onChangeSpaceFilter('datePickerFocused', focused)}
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
                    focused={state.datePickerFocused}
                    onFocusChange={() => setState({datePickerFocused: !state.datePickerFocused})}
                  />;
              }
            })}
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
      {}
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
