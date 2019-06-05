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
  DEFAULT_TIME_SEGMENT_LABEL,
  parseStartAndEndTimesInTimeSegment,
  getAllTimeSegmentLabelsForSpace,
  getShownTimeSegmentsForSpace,
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
      spaceHierarchy,
      activeModal,
      resizeCounter,
      onChangeSpaceFilter,
      onChangeDate,
      onChangeTimeSegmentLabel,
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
          <ExploreFilterBarItem label="Time segment">
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
                    return { id: label, label: 'Whole day (12:00a - 11:59p)' }
                  } else {
                    return {
                      id: label,
                      label: `${label} (mixed hours)`
                    };
                  }
                })
              }
              width={300}

              onChange={value => onChangeTimeSegmentLabel(space, value.id)}
            />
          </ExploreFilterBarItem>
        </ExploreFilterBar>

        <ErrorBar
          message={spaces.error}
          modalOpen={activeModal.name !== null}
        />

        <ExploreSpaceHeader />

        <div className={styles.exploreSpaceDailyContainer}>
          <div className={styles.exploreSpaceDaily}>
            <div className={styles.exploreSpaceDailyItem}>
              <FootTrafficCard
                space={space}
                date={spaces.filters.date}
                timeSegmentLabel={selectedTimeSegmentLabel}
                timeSegments={applicableTimeSegments}
                chartWidth={this.state.width}
              />
            </div>
            <div className={styles.exploreSpaceDailyItem}>
              <RawEventsCard
                space={space}
                date={spaces.filters.date}
                timeSegmentLabel={selectedTimeSegmentLabel}
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
    spaceHierarchy: state.spaceHierarchy,
    activeModal: state.activeModal,
    resizeCounter: state.resizeCounter,
  };
}, dispatch => {
  return {
    onChangeSpaceFilter(key, value) {
      dispatch(collectionSpacesFilter('dailyRawEventsPage', 1));
      dispatch(collectionSpacesFilter(key, value));
    },
    onChangeTimeSegmentLabel(space, value) {
      dispatch(collectionSpacesFilter('timeSegmentLabel', value));
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
