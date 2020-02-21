import React, { useEffect, useState, Fragment } from 'react';
import moment from 'moment-timezone';

import grid from '@density/ui/variables/grid.json';
import spacing from '@density/ui/variables/spacing.json';
import colors from '@density/ui/variables/colors.json';

import { DateRangePicker, Button, InputBox } from '@density/ui/src';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import { REPORTS, ReportWrapper, ReportNoData, SingleReportLoading } from '@density/reports';

import { getGoSlow } from '../environment-switcher';
import core from '../../client/core';
import DashboardReport from '../dashboard-report';
import getCommonRangesForSpace from '../../helpers/common-ranges';
import { SpacesPageState } from '../../rx-stores/spaces-page/reducer';
import { TimeRangeDisplay, TimeFilterSlider, RangeSliderValue, realizeRangeSliderValue, TimeFilterDayToggles } from '../analytics-control-bar-time-filter';
import { timeOfDayToMilliseconds, millisecondsToTimeOfDay } from '../../helpers/datetime-utilities/time-string';
import { QueryInterval } from '../../types/analytics';
import Checkbox from '../checkbox';
// import { serializeTimeFilter } from '../../helpers/datetime-utilities';
import { DayOfWeek } from '../../types/datetime';
import { CoreDoorway } from '@density/lib-api-types/core-v2/doorways';
import { DEFAULT_TIME_SEGMENT_LABEL, parseStartAndEndTimesInTimeSegment } from '../../helpers/time-segments';
import { prettyPrintHoursMinutes, getCurrentLocalTimeAtSpace } from '../../helpers/space-time-utilities';


// Date range picker control for reports section
export function SpacesReportDateRangePicker({
  startDate,
  endDate,
  space,
  onChange,
}: {
  startDate: string,
  endDate: string,
  space: CoreSpace,
  onChange: Function
}) {
  const [focused, setFocused] = useState(null);
  return (
    <div>
      <DateRangePicker
        startDate={moment(startDate)}
        endDate={moment(endDate)}
        onChange={value => {
          // Only update the start and end data if at least one of them has changed
          if (value.startDate !== startDate || value.endDate !== endDate) {
            onChange({
              startDate: (value.startDate || moment()).format('YYYY-MM-DD'),
              endDate: (value.endDate || moment()).format('YYYY-MM-DD'),
            });
          }
        }}
        focusedInput={focused}
        onFocusChange={focused => setFocused(focused)}
        numberOfMonths={document.body && document.body.clientWidth > grid.screenSmMin ? 2 : 1}
        isOutsideRange={day => {
          const dayString = day.format('YYYY-MM-DD');
          const todayString = moment.tz(space.time_zone).format('YYYY-MM-DD');
          return !moment(dayString).isSameOrBefore(moment(todayString));
        }}
        commonRanges={getCommonRangesForSpace(space)}
        onSelectCommonRange={({startDate, endDate}) => onChange({
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
        })}
      />
    </div>
  );
}

// Time segment picker control for reports section
export function SpacesReportTimeSegmentLabelPicker({
  timeSegmentLabel,
  spaceTimeSegmentLabels,
  shownTimeSegments,
  selectedSpace,
  onChange,
}) {
  return <InputBox
    type="select"
    width={280}
    value={timeSegmentLabel}
    choices={spaceTimeSegmentLabels
      // Remove multiple entries from the list if a time segment shows up multiple times
      .filter((label, index) => spaceTimeSegmentLabels.indexOf(label) === index)
      .map(label => {
        const applicableTimeSegmentsForLabel = shownTimeSegments.filter(i => i.label === label);
        if (applicableTimeSegmentsForLabel.length === 1) {
          const timeSegment = applicableTimeSegmentsForLabel[0];
          const {startSeconds, endSeconds} = parseStartAndEndTimesInTimeSegment(timeSegment);
          return {
            id: label,
            label: `${label} (${prettyPrintHoursMinutes(
              getCurrentLocalTimeAtSpace(selectedSpace).startOf('day').add(startSeconds, 'seconds')
            )} - ${prettyPrintHoursMinutes(
              getCurrentLocalTimeAtSpace(selectedSpace).startOf('day').add(endSeconds, 'seconds')
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
    onChange={value => onChange(value.id)}
  />;
}

// Time filter picker control for reports section
// NOTE: This uses several primitive components from the analytics page, these should be refactored
// TODO: Actually use this
export function SpacesReportTimeFilterPicker({
  timeFilter,
  onChange,
}: {
  timeFilter: SpacesPageState['timeFilter'],
  onChange: Function,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOvernight, setIsOvernight] = useState(timeFilter.isOvernight);
  const [sliderValue, setSliderValue] = useState<RangeSliderValue>([
    timeOfDayToMilliseconds(timeFilter.isOvernight ? timeFilter.end : timeFilter.start),
    timeOfDayToMilliseconds(timeFilter.isOvernight ? timeFilter.start : timeFilter.end),
  ]);
  const [start, end] = realizeRangeSliderValue(sliderValue, isOvernight);
  return <div style={{display: 'flex', alignItems: 'center', position: 'relative'}}>
    <TimeFilterDayToggles
      dayToggles={timeFilter.daysOfWeek}
      onClickDay={(day: DayOfWeek) => {
        onChange({
          daysOfWeek: { ...timeFilter.daysOfWeek, [day]: !timeFilter.daysOfWeek[day] }
        })
      }}
    />
    <div
      style={{
        padding: '6px 0',
        border: `1px solid ${dropdownOpen ? colors.blueDark : colors.inputFieldBorderColor}`,
        borderRadius: spacing.borderRadiusBase,
        background: colors.white,
        cursor: 'pointer'
      }}
      onClick={() => setDropdownOpen(!dropdownOpen)}
    >
      <TimeRangeDisplay start={start} end={end}/>
    </div>
    {dropdownOpen ? <div style={{
      position: 'absolute',
      top: 50,
      right: 0,
      width: 300,
      padding: 20,
      backgroundColor: colors.white,
      border: `1px solid ${colors.inputFieldBorderColor}`,
      borderRadius: spacing.borderRadiusBase,
      zIndex: 1,
    }}>
      <TimeFilterSlider
        value={sliderValue}
        interval={QueryInterval.FIFTEEN_MINUTES}
        isOvernight={isOvernight}
        onChange={(value: RangeSliderValue) => setSliderValue(value)}
      />
      <div style={{padding: '16px 0', display: 'flex', alignItems: 'center'}}>
        Overnight&nbsp;&nbsp;
        <Checkbox checked={isOvernight} onChange={() => setIsOvernight(!isOvernight)} />
      </div>
      <Button width="100%" onClick={() => {
        setDropdownOpen(false);
        onChange({
          isOvernight,
          start: millisecondsToTimeOfDay(isOvernight ? sliderValue[1] : sliderValue[0]),
          end: millisecondsToTimeOfDay(isOvernight ? sliderValue[0] : sliderValue[1]),
        });
      }}>Apply</Button>
    </div> : null}
  </div>
}

// Helper to generate report configuration
function getReportConfig(name, type, space, startDate, endDate, otherSettings, timeSegmentLabel, doorway) {
  return {
    name,
    type,
    settings: {
      ...otherSettings,
      space_id: space.id,
      doorway_id: doorway ? doorway.id : undefined,
      time_segment_labels: timeSegmentLabel === DEFAULT_TIME_SEGMENT_LABEL ? undefined : [timeSegmentLabel],
      // time_filters: serializedTimeFilter,
      time_range: {
        type: 'CUSTOM_RANGE',
        start_date: moment.tz(startDate, space.time_zone),
        end_date: moment.tz(endDate, space.time_zone).add(1, 'day'),
      }
    },
  };
}

// CAUTION: This wrapper component LOADS DATA from the API whenever its settings change,
// not a good idea to just do anywhere, but it is currently the easiest way to encapsulate
// both a report and its calculations, and should be OK until we can update reports further
export function EphemeralReport({
  name,
  type,
  space,
  doorway,
  startDate,
  endDate,
  timeSegmentLabel,
  otherSettings,
}: {
  name: string,
  type: string,
  space: CoreSpace,
  doorway?: CoreDoorway,
  startDate: string,
  endDate: string,
  timeSegmentLabel: SpacesPageState['timeSegmentLabel'],
  // timeFilter: SpacesPageState['timeFilter'],
  otherSettings: Object,
}) {
  const [state, setState] = useState({
    data: null as any,
    loading: true,
    error: null as Error | null
  });

  // // Since this is a string, we can re-compute it every render, and the useEffect dependency will not invalidate
  // const serializedTimeFilter = serializeTimeFilter([{
  //   start: timeFilter.start,
  //   end: timeFilter.end,
  //   days: Object.keys(timeFilter.daysOfWeek).map(day => timeFilter.daysOfWeek[day] && day).filter(x => x) as Any<FixInRefactor>
  // }]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setState({data: null, loading: true, error: null});
      try {
        const data = await REPORTS[type].calculations(
          getReportConfig(name, type, space, startDate, endDate, otherSettings, timeSegmentLabel, doorway),
          { client: core(), slow: getGoSlow() }
        );
        if (!cancelled) { setState({data, loading: false, error: null}); }
      } catch (error) {
        if (!cancelled) { setState({data: null, loading: false, error}); }
      }
    }
    fetchData();
    return () => { cancelled = true; }
  }, [name, type, space, startDate, endDate, otherSettings, timeSegmentLabel, doorway]);

  return <Fragment>
    {(state.loading || state.error) ? <ReportWrapper
      title={name}
      spaces={[space.name]}
      startDate={startDate}
      endDate={endDate}
    >
      {state.loading ? <SingleReportLoading /> : <ReportNoData />}
    </ReportWrapper> : <DashboardReport
      report={getReportConfig(name, type, space, startDate, endDate, otherSettings, timeSegmentLabel, doorway)}
      reportData={{
        data: {...state.data, scrollable: true},
        state: 'COMPLETE',
        error: null,
      }}
    />}
    <div style={{height:16}}></div>
  </Fragment>;
}

// Wrappers for loading ephemeral reports on the spaces page
type SpacesReportProps = {
  space: CoreSpace,
  doorway?: CoreDoorway,
  startDate: string,
  endDate: string,
  timeSegmentLabel: SpacesPageState['timeSegmentLabel'],
};

// Since otherSettings is a dependency of the reload effect,
// We have to set constant references rather than passing literals each time
// Otherwise, the reference equality will fail and the report will reload
const dailyEntrancesOtherSettings = {metric: 'ENTRANCES'}
export function DailyEntrances(props: SpacesReportProps) {
  return <EphemeralReport
    name="Daily Entrances"
    type="PERIODIC_METRICS"
    otherSettings={dailyEntrancesOtherSettings}
    {...props}
  />;
}

const dailyExitsOtherSettings = {metric: 'EXITS'};
export function DailyExits(props: SpacesReportProps) {
  return <EphemeralReport
    name="Daily Exits"
    type="PERIODIC_METRICS"
    otherSettings={dailyExitsOtherSettings}
    {...props}
  />;
}

const entrancesPerHourOtherSettings = {
  metric: 'VISITS',
  aggregation: 'NONE',
  include_weekends: true,
  hour_start: 6,
  hour_end: 20
};
export function EntrancesPerHour(props: SpacesReportProps) {
  return <EphemeralReport
    name="Entrances per Hour"
    type="HOURLY_BREAKDOWN"
    otherSettings={entrancesPerHourOtherSettings}
    {...props}
  />;
}

const averagePeakOccupancyPerHourOtherSettings = {
  metric: 'PEAKS',
  aggregation: 'AVERAGE',
  include_weekends: true,
  hour_start: 6,
  hour_end: 20
};
export function AveragePeakOccupancyPerHour(props: SpacesReportProps) {
  return <EphemeralReport
    name="Average Peak Occupancy per Hour"
    type="HOURLY_BREAKDOWN"
    otherSettings={averagePeakOccupancyPerHourOtherSettings}
    {...props}
  />;
}

const dailyPeakOccupancyOtherSettings = {metric: 'PEAK_OCCUPANCY'};
export function DailyPeakOccupancy(props: SpacesReportProps) {
  return <EphemeralReport
    name="Daily Peak Occupancy"
    type="PERIODIC_METRICS"
    otherSettings={dailyPeakOccupancyOtherSettings}
    {...props}
  />;
}

const emptyOtherSettings = {};
export function TimeOccupied(props: SpacesReportProps) {
  return <EphemeralReport
    name="Time Occupied"
    type="TIME_OCCUPIED"
    otherSettings={emptyOtherSettings}
    {...props}
  />;
}

export function OccupancyDistribution(props: SpacesReportProps) {
  return <EphemeralReport
    name="Room Use"
    type="OCCUPANCY_DISTRIBUTION"
    otherSettings={emptyOtherSettings}
    {...props}
  />;
}

export function PopularTimes(props: SpacesReportProps) {
  return <EphemeralReport
    name="Popular Times"
    type="POPULAR_TIMES"
    otherSettings={emptyOtherSettings}
    {...props}
  />;
}

export function MeetingAttendance(props: SpacesReportProps) {
  return <EphemeralReport
    name="Meeting Attendance"
    type="MEETING_ATTENDANCE"
    otherSettings={emptyOtherSettings}
    {...props}
  />;
}

export function MeetingSize(props: SpacesReportProps) {
  return <EphemeralReport
    name="Meeting Size"
    type="MEETING_SIZE"
    otherSettings={emptyOtherSettings}
    {...props}
  />;
}

export function BookerBehavior(props: SpacesReportProps) {
  return <EphemeralReport
    name="Booker Behavior"
    type="BOOKING_BEHAVIOR"
    otherSettings={emptyOtherSettings}
    {...props}
  />;
}

export function DayToDayMeetings(props: SpacesReportProps) {
  return <EphemeralReport
    name="Day-to-day Meetings"
    type="DAY_TO_DAY_MEETINGS"
    otherSettings={emptyOtherSettings}
    {...props}
  />;
}
