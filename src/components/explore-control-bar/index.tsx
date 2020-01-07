import styles from './styles.module.scss';

import React from 'react';

import gridVariables from '@density/ui/variables/grid.json';

import {
  AppBar,
  AppBarSection,
  DatePicker,
  DateRangePicker,
  InputBox,
} from '@density/ui/src';

import { isInclusivelyBeforeDay } from '@density/react-dates';

import { formatForReactDates, parseISOTimeAtSpace, formatInISOTime, parseFromReactDates, getCurrentLocalTimeAtSpace, prettyPrintHoursMinutes } from '../../helpers/space-time-utilities';

import collectionSpacesFilter from '../../rx-actions/collection/spaces/filter';
import { calculate as calculateDailyModules } from '../../rx-actions/route-transition/explore-space-daily';
import { parseStartAndEndTimesInTimeSegment, getShownTimeSegmentsForSpace, DEFAULT_TIME_SEGMENT_LABEL } from '../../helpers/time-segments';
import isOutsideRange from '../../helpers/date-range-picker-is-outside-range';
import getCommonRangesForSpace from '../../helpers/common-ranges';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import { ActivePageState } from '../../rx-stores/active-page';
import { DensitySpace } from '../../types';
import { SpaceHierarchyState } from '../../rx-stores/space-hierarchy';

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

// FIXME
type TemporaryExternalProps = {
  spaceHierarchy: SpaceHierarchyState,
  activePage: ActivePageState,
  selectedSpace: DensitySpace,
  filters: {
    dailyRawEventsPage: number,
    dataDuration: Any<FixInRefactor>,
    date: string | null,
    startDate: string | null,
    endDate: string | null,
    doorwayId: string | null,
    parent: Any<FixInRefactor>,
    search: string,
    sort: Any<FixInRefactor>,
    timeSegmentLabel: Any<FixInRefactor>,
    metricToDisplay: Any<FixInRefactor>,
  }
}

// FIXME: external props
const ConnectedExploreControlBar: React.FC<TemporaryExternalProps> = (externalProps) => {

  const dispatch = useRxDispatch();

  const onChangeSpaceFilter = (key, value) => {
    dispatch(collectionSpacesFilter('dailyRawEventsPage', 1) as Any<FixInRefactor>);
    dispatch(collectionSpacesFilter(key, value) as Any<FixInRefactor>);
  }
  const onChangeDate = async (activePage, space, value) => {
    dispatch(collectionSpacesFilter('date', value) as Any<FixInRefactor>);
    dispatch(collectionSpacesFilter('dailyRawEventsPage', 1) as Any<FixInRefactor>);
    if (activePage === 'SPACES_SPACE_DAILY') {
      await calculateDailyModules(dispatch, space);
    }
  }
  const onChangeTimeSegmentLabel = async (activePage, space, spaceFilters, value) => {
    dispatch(collectionSpacesFilter('timeSegmentLabel', value) as Any<FixInRefactor>);
    dispatch(collectionSpacesFilter('dailyRawEventsPage', 1) as Any<FixInRefactor>);
    if (activePage === 'SPACES_SPACE_DAILY') {
      await calculateDailyModules(dispatch, space);
    }
  }
  const onChangeDateRange = (activePage, space, spaceFilters, startDate, endDate) => {
    dispatch(collectionSpacesFilter('startDate', startDate) as Any<FixInRefactor>);
    dispatch(collectionSpacesFilter('endDate', endDate) as Any<FixInRefactor>);
  }

  return (
    <ExploreControlBarRaw
      {...externalProps}
      onChangeSpaceFilter={onChangeSpaceFilter}
      onChangeDate={onChangeDate}
      onChangeTimeSegmentLabel={onChangeTimeSegmentLabel}
      onChangeDateRange={onChangeDateRange}
    />
  )
}
export default ConnectedExploreControlBar;
