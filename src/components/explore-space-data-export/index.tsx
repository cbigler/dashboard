import styles from './styles.module.scss';

import React from 'react';
import { connect } from 'react-redux';

import gridVariables from '@density/ui/variables/grid.json';
import { DateRangePicker } from '@density/ui';

import ExploreFilterBar, { ExploreFilterBarItem } from '../explore-filter-bar/index';
import ExploreSpaceHeader from '../explore-space-header/index';

import RawEventsExportCard from '../explore-space-detail-raw-events-export-card/index';

import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import getCommonRangesForSpace from '../../helpers/common-ranges';

import isOutsideRange, {
  MAXIMUM_DAY_LENGTH,
} from '../../helpers/date-range-picker-is-outside-range/index';

import {
  parseISOTimeAtSpace,
  parseFromReactDates,
  formatInISOTime,
  formatForReactDates,
} from '../../helpers/space-time-utilities/index';

// When the user selects a start date, select a range that's this long. THe user can stil ladjust
// the range up to a maximum length of `MAXIMUM_DAY_LENGTH` though.
const INITIAL_RANGE_SELECTION = MAXIMUM_DAY_LENGTH / 2;

function ExploreSpaceDataExport({
  spaces,
  space,
  onChangeSpaceFilter,
}) {
  if (space) {
    return <div className={styles.exploreSpaceDataExportPage}>
      {spaces.filters.startDate && spaces.filters.endDate ? (
        <ExploreFilterBar>
          <ExploreFilterBarItem label="Date range">
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
                startDate = parseFromReactDates(startDate, space);
                endDate = parseFromReactDates(endDate, space);

                // If the user selected over 14 days, then clamp them back to 14 days.
                if (startDate && endDate && endDate.diff(startDate, 'days') > MAXIMUM_DAY_LENGTH) {
                  endDate = startDate.clone().add(INITIAL_RANGE_SELECTION-1, 'days');
                }

                onChangeSpaceFilter('startDate', formatInISOTime(startDate));
                onChangeSpaceFilter('endDate', formatInISOTime(endDate));
              }}
              // Within the component, store if the user has selected the start of end date picker
              // input
              focusedInput={spaces.filters.datePickerInput}
              onFocusChange={(focused, a) => {
                onChangeSpaceFilter('datePickerInput', focused);
              }}

              // On mobile, make the calendar one month wide and left aligned.
              // On desktop, the calendar is two months wide and right aligned.
              numberOfMonths={document.body && document.body.clientWidth > gridVariables.screenSmMin ? 2 : 1}

              isOutsideRange={day => isOutsideRange(space, day)}

              // common ranges functionality
              commonRanges={getCommonRangesForSpace(space)}
              onSelectCommonRange={({startDate, endDate}) => {
                onChangeSpaceFilter('startDate', startDate);
                onChangeSpaceFilter('endDate', endDate);
              }}
            />
          </ExploreFilterBarItem>
        </ExploreFilterBar>
      ) : null}

      <ExploreSpaceHeader />

      {spaces.filters.startDate && spaces.filters.endDate ? (
        <div className={styles.exploreSpaceDataExportContainer}>
          <div className={styles.exploreSpaceDataExport}>
            <div className={styles.exploreSpaceDataExportItem}>
              <RawEventsExportCard
                space={space}
                startDate={spaces.filters.startDate}
                endDate={spaces.filters.endDate}
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
  };
}, dispatch => {
  return {
    onChangeSpaceFilter(key, value) {
      dispatch(collectionSpacesFilter(key, value));
    },
  };
})(ExploreSpaceDataExport);
