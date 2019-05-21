import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

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

import styles from './styles.module.scss';

import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import getCommonRangesForSpace from '../../helpers/common-ranges';
import isMultiWeekSelection from '../../helpers/multi-week-selection/index';
import {
  DEFAULT_TIME_SEGMENT_LABEL,
  parseStartAndEndTimesInTimeSegment,
  getAllTimeSegmentLabelsForSpace,
  getShownTimeSegmentsForSpace,
} from '../../helpers/time-segments/index';

import isOutsideRange, {
  MAXIMUM_DAY_LENGTH,
} from '../../helpers/date-range-picker-is-outside-range/index';

// When the user selects a start date, select a range that's this long. THe user can stil ladjust
// the range up to a maximum length of `MAXIMUM_DAY_LENGTH` though.
const INITIAL_RANGE_SELECTION = MAXIMUM_DAY_LENGTH / 2;

class ExploreSpaceTrends extends React.Component<any, any> {
  container: any;
  state = { width: 0 }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const width = this.container.offsetWidth - 80;
    if (width !== prevState.width) {
      this.setState({width});
    }
  }

  render() {
    const {
      spaces,
      space,
      spaceHierarchy,
      activeModal,
      onChangeSpaceFilter,
      onChangeTimeSegmentLabel,
      onChangeDateRange,
      resizeCounter,
    } = this.props;

    if (space) {
      const shownTimeSegments = getShownTimeSegmentsForSpace(space, spaceHierarchy.data);
      const spaceTimeSegmentLabelsArray = [
        DEFAULT_TIME_SEGMENT_LABEL,
        ...shownTimeSegments.map(i => i.label),
      ];

      // Which time segment label was selected?
      const selectedTimeSegmentLabel = spaces.filters.timeSegmentLabel;

      // And, with the knowlege of the selected space, which time segment within that time segment
      // label is applicable to this space?
      const applicableTimeSegments = shownTimeSegments.filter(i => i.label === selectedTimeSegmentLabel);

      const multiWeekSelection = isMultiWeekSelection(spaces.filters.startDate, spaces.filters.endDate);

      return <div className={styles.exploreSpaceTrendsPage} ref={r => { this.container = r; }}>
        {spaces.filters.startDate && spaces.filters.endDate ? (
          <ExploreFilterBar>
            <ExploreFilterBarItem label="Time Segment">
              <InputBox
                type="select"
                className={styles.exploreSpaceTrendsTimeSegmentBox}
                value={selectedTimeSegmentLabel}
                choices={spaceTimeSegmentLabelsArray.map(label => {
                  if (applicableTimeSegments.length === 1) {
                    const timeSegment = applicableTimeSegments[0];
                    const {startSeconds, endSeconds} = parseStartAndEndTimesInTimeSegment(timeSegment);
                    return {
                      id: label,
                      label: `${label} (${prettyPrintHoursMinutes(
                        getCurrentLocalTimeAtSpace(space)
                          .startOf('day')
                          .add(startSeconds, 'seconds')
                      )} - ${prettyPrintHoursMinutes(
                        getCurrentLocalTimeAtSpace(space)
                          .startOf('day')
                          .add(endSeconds, 'seconds')
                      )})`,
                    };
                  } else if (label === DEFAULT_TIME_SEGMENT_LABEL) {
                    return { id: label, label: 'Whole Day (12:00 - 11:59p)' }
                  } else {
                    return {
                      id: label,
                      label: `${label} (Mixed hours)`
                    };
                  }
                })}
                width={300}
                onChange={value => onChangeTimeSegmentLabel(space, value.id, spaces.filters)}
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
                  if (startDate) {
                    startDate = parseFromReactDates(startDate, space).startOf('day');
                  } else {
                    startDate = parseISOTimeAtSpace(spaces.filters.startDate, space);
                  }
                  if (endDate) {
                    endDate = parseFromReactDates(endDate, space).endOf('day');
                  } else {
                    endDate = parseISOTimeAtSpace(spaces.filters.endDate, space);
                  }

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

                isOutsideRange={day => isOutsideRange(space, day)}

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
            </ExploreFilterBarItem>
          </ExploreFilterBar>
        ) : null}

        <ErrorBar
          message={spaces.error}
          modalOpen={activeModal.name !== null}
        />

        {spaces.filters.startDate && spaces.filters.endDate ? <ExploreSpaceHeader /> : null}

        {spaces.filters.startDate && spaces.filters.endDate ? (
          <div className={styles.exploreSpaceTrendsContainer} >
            <div className={styles.exploreSpaceTrends} ref={r => { this.container = r; }}>
              <div className={styles.exploreSpaceTrendsItem}>
                <DailyMetricsCard
                  space={space}
                  startDate={spaces.filters.startDate}
                  endDate={spaces.filters.endDate}
                  timeSegmentLabel={selectedTimeSegmentLabel}
                  chartWidth={this.state.width}
                />
              </div>
              <div className={styles.exploreSpaceTrendsItem}>
                <HourlyBreakdownCard 
                  space={space}
                  startDate={spaces.filters.startDate}
                  endDate={spaces.filters.endDate}
                  metric="VISITS"
                  title="Hourly Breakdown - Visits"
                  aggregation="NONE"
                />
              </div>
              <div className={styles.exploreSpaceTrendsItem}>
                <HourlyBreakdownCard 
                  space={space}
                  startDate={spaces.filters.startDate}
                  endDate={spaces.filters.endDate}
                  metric="PEAKS"
                  title={multiWeekSelection ? "Hourly Breakdown - Average Peak Occupancy" : "Hourly Breakdown - Peak Occupancy"}
                  aggregation="AVERAGE"
                />
              </div>
              <div className={styles.exploreSpaceTrendsItem}>
                <UtilizationCard
                  space={space}
                  startDate={spaces.filters.startDate}
                  endDate={spaces.filters.endDate}
                  timeSegmentLabel={selectedTimeSegmentLabel}
                  timeSegments={applicableTimeSegments}
                  chartWidth={this.state.width}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>;
    } else {
      return <div ref={r => { this.container = r; }}></div>;
    }
  }
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    space: state.spaces.data.find(space => space.id === state.spaces.selected),
    spaceHierarchy: state.spaceHierarchy,
    activeModal: state.activeModal,
    resizeCounter: state.resizeCounter,
  };
}, dispatch => {
  return {
    onChangeSpaceFilter(space, key, value) {
      dispatch(collectionSpacesFilter(key, value));
    },
    onChangeTimeSegmentLabel(space, value, spaceFilters) {
      dispatch(collectionSpacesFilter('timeSegmentLabel', value));
      dispatch<any>(calculateTrendsModules(space, spaceFilters));
    },
    onChangeDateRange(space, startDate, endDate, spaceFilters) {
      dispatch(collectionSpacesFilter('startDate', startDate));
      dispatch(collectionSpacesFilter('endDate', endDate));
      dispatch<any>(calculateTrendsModules(space, spaceFilters));
    },
  };
})(ExploreSpaceTrends);
