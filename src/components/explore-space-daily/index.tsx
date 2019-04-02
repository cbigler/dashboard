import styles from './styles.module.scss';

import React from 'react';
import { connect } from 'react-redux';

import {
  DatePicker,
  InputBox,
} from '@density/ui';

import { isInclusivelyBeforeDay } from '@density/react-dates';

import {
  getCurrentLocalTimeAtSpace,
  parseISOTimeAtSpace,
  parseFromReactDates,
  formatInISOTime,
  formatForReactDates,
  prettyPrintHoursMinutes,
} from '../../helpers/space-time-utilities/index';
import { calculate as calculateDailyModules } from '../../actions/route-transition/explore-space-daily';

import ExploreFilterBar, { ExploreFilterBarItem } from '../explore-filter-bar/index';
import ExploreSpaceHeader from '../explore-space-header/index';
import FootTrafficCard from '../explore-space-detail-foot-traffic-card/index';
import RawEventsCard from '../explore-space-detail-raw-events-card/index';
import ErrorBar from '../error-bar/index';

import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import {
  DEFAULT_TIME_SEGMENT_GROUP,
  findTimeSegmentsInTimeSegmentGroupForSpace,
  parseStartAndEndTimesInTimeSegment,
} from '../../helpers/time-segments/index';

class ExploreSpaceDaily extends React.Component<any, any> {
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
      timeSegmentGroups,
      activeModal,
      resizeCounter,
      onChangeSpaceFilter,
      onChangeDate,
      onChangeTimeSegmentGroup,
    } = this.props;

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
      const applicableTimeSegments = findTimeSegmentsInTimeSegmentGroupForSpace(
        selectedTimeSegmentGroup,
        space,
      );

      return <div className={styles.exploreSpaceDailyPage} ref={r => { this.container = r; }}>
        <ExploreFilterBar>
          <ExploreFilterBarItem label="Day">
            <DatePicker
              date={formatForReactDates(parseISOTimeAtSpace(spaces.filters.date, space), space)}
              onChange={date => onChangeDate(space, formatInISOTime(parseFromReactDates(date, space)))}

              focused={spaces.filters.datePickerFocused}
              onFocusChange={({focused}) => onChangeSpaceFilter('datePickerFocused', focused)}
              arrowRightDisabled={
                parseISOTimeAtSpace(spaces.filters.date, space).format('MM/DD/YYYY') ===
                getCurrentLocalTimeAtSpace(space).format('MM/DD/YYYY')
              }

              isOutsideRange={day => !isInclusivelyBeforeDay(
                day,
                getCurrentLocalTimeAtSpace(space).startOf('day'),
              )}
            />
          </ExploreFilterBarItem>
          <ExploreFilterBarItem label="Time Segment">
            <InputBox
              type="select"
              className={styles.exploreSpaceDailyTimeSegmentBox}
              value={selectedTimeSegmentGroup.id}
              choices={spaceTimeSegmentGroupArray.map(ts => {
                const applicableTimeSegmentsForGroup = findTimeSegmentsInTimeSegmentGroupForSpace(
                  ts,
                  space,
                );
                if (applicableTimeSegmentsForGroup.length === 1) {
                  const timeSegment = applicableTimeSegmentsForGroup[0];
                  const {startSeconds, endSeconds} = parseStartAndEndTimesInTimeSegment(timeSegment);
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
                } else {
                  return {
                    id: ts.id,
                    label: `${ts.name} (Mixed hours)`
                  };
                }
              })}
              width={300}
              onChange={value => onChangeTimeSegmentGroup(space, value.id)}
            />
          </ExploreFilterBarItem>
        </ExploreFilterBar>

        <ErrorBar
          message={spaces.error || timeSegmentGroups.error}
          modalOpen={activeModal.name !== null}
        />

        <ExploreSpaceHeader />

        <div className={styles.exploreSpaceDailyContainer}>
          <div className={styles.exploreSpaceDaily}>
            <div className={styles.exploreSpaceDailyItem}>
              <FootTrafficCard
                space={space}
                date={spaces.filters.date}
                timeSegmentGroup={selectedTimeSegmentGroup}
                timeSegments={applicableTimeSegments}
                chartWidth={this.state.width}
              />
            </div>
            <div className={styles.exploreSpaceDailyItem}>
              <RawEventsCard
                space={space}
                date={spaces.filters.date}
                timeSegmentGroup={selectedTimeSegmentGroup}
              />
            </div>
          </div>
        </div>
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
    timeSegmentGroups: state.timeSegmentGroups,
    activeModal: state.activeModal,
    resizeCounter: state.resizeCounter,
  };
}, dispatch => {
  return {
    onChangeSpaceFilter(key, value) {
      dispatch(collectionSpacesFilter('dailyRawEventsPage', 1));
      dispatch(collectionSpacesFilter(key, value));
    },
    onChangeTimeSegmentGroup(space, value) {
      dispatch(collectionSpacesFilter('timeSegmentGroupId', value));
      dispatch(collectionSpacesFilter('dailyRawEventsPage', 1));
      dispatch<any>(calculateDailyModules(space));
    },
    onChangeDate(space, value) {
      dispatch(collectionSpacesFilter('date', value));
      dispatch(collectionSpacesFilter('dailyRawEventsPage', 1));
      dispatch<any>(calculateDailyModules(space));
    },
  };
})(ExploreSpaceDaily);
