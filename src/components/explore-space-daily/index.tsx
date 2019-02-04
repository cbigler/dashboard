import React from 'react';
import { connect } from 'react-redux';

import InputBox from '@density/ui-input-box';
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

import Subnav, { SubnavItem } from '../subnav/index';
import ExploreFilterBar, { ExploreFilterBarItem } from '../explore-filter-bar/index';
import ExploreSpaceHeader from '../explore-space-header/index';
import FootTrafficCard from '../explore-space-detail-foot-traffic-card/index';
import RawEventsCard from '../explore-space-detail-raw-events-card/index';
import ErrorBar from '../error-bar/index';

import DatePicker from '@density/ui-date-picker';

import collectionSpacesFilter from '../../actions/collection/spaces/filter';

import {
  DEFAULT_TIME_SEGMENT_GROUP,
  findTimeSegmentInTimeSegmentGroupForSpace,
  parseStartAndEndTimesInTimeSegment,
} from '../../helpers/time-segments/index';

class ExploreSpaceDaily extends React.Component<any, any> {
  container: any;
  state = { width: 0 }

  componentDidMount() {
    this.resizeCharts()
    window.addEventListener('resize', this.resizeCharts);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeCharts);
  }

  resizeCharts = () => {
    const width = this.container.offsetWidth - 80;
    this.setState({width});
  }

  render() {
    const {
      spaces,
      space,
      timeSegmentGroups,
      activeModal,
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
      const applicableTimeSegment = findTimeSegmentInTimeSegmentGroupForSpace(
        selectedTimeSegmentGroup,
        space,
      );

      return <div className="explore-space-daily-page" ref={r => { this.container = r; }}>
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
              className="explore-space-daily-time-segment-box"
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
        </ExploreFilterBar>

        <ErrorBar
          message={spaces.error || timeSegmentGroups.error}
          modalOpen={activeModal.name !== null}
        />

        <ExploreSpaceHeader />

        <div className="explore-space-daily-container">
          <div className="explore-space-daily">
            <div className="explore-space-daily-item">
              <FootTrafficCard
                space={space}
                date={spaces.filters.date}
                timeSegmentGroup={selectedTimeSegmentGroup}
                timeSegment={applicableTimeSegment}
                chartWidth={this.state.width}
              />
            </div>
            <div className="explore-space-daily-item">
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
  };
}, dispatch => {
  return {
    onChangeSpaceFilter(key, value) {
      dispatch(collectionSpacesFilter(key, value));
    },
    onChangeTimeSegmentGroup(space, value) {
      dispatch(collectionSpacesFilter('timeSegmentGroupId', value));
      dispatch<any>(calculateDailyModules(space));
    },
    onChangeDate(space, value) {
      dispatch(collectionSpacesFilter('date', value));
      dispatch<any>(calculateDailyModules(space));
    },
  };
})(ExploreSpaceDaily);
