import React, { useEffect, useReducer, useRef, useState } from 'react';
import classNames from 'classnames';
import { TimeFilter, DayOfWeek } from '../../types/datetime';
import { Button, Checkbox, Icons } from '@density/ui';
import { Popover } from '@material-ui/core';
import isEqual from 'lodash/isEqual'; 

import Slider from '../slider';
import styles from './styles.module.scss';
import { DAYS_OF_WEEK } from '../../helpers/datetime-utilities';
import {
  DAY_MILLISECONDS,
  HOUR_MILLISECONDS,
  MINUTE_MILLISECONDS,
  timeOfDayToMilliseconds,
  millisecondsToTimeOfDay
} from '../../helpers/datetime-utilities/time-string';
import { QueryInterval } from '../../types/analytics';
import { TimeOfDay } from '../../types/datetime';

/**
 * The API supports multiple time filter objects but the control bar UI
 * currently allows only a single time filter segment. That's why the 
 * type used here is `TimeFilter[0]` rather than just `TimeFilter`
 */
const DEFAULT_TIME_FILTER: TimeFilter[0] = {
  start: { hour: 0, minute: 0, second: 0, millisecond: 0 },
  end: { hour: 24, minute: 0, second: 0, millisecond: 0 },
  days: [...DAYS_OF_WEEK],
}

const TIME_OF_DAY_MARKS = [{
  value: 0,
  label: '12a',
}, {
  value: 6 * HOUR_MILLISECONDS,
  label: '6a',
}, {
  value: 12 * HOUR_MILLISECONDS,
  label: '12p',
}, {
  value: 18 * HOUR_MILLISECONDS,
  label: '6p',
}, {
  value: 24 * HOUR_MILLISECONDS,
  label: '12a',
}]

type RangeSliderValue = [number, number]

const TimeFilterSlider: React.FC<{
  value: RangeSliderValue,
  interval: QueryInterval,
  isOvernight: boolean,
  onChange: (value: RangeSliderValue) => void,
}> = function TimeFilterSlider({
  value,
  interval,
  isOvernight,
  onChange,
}) {
  
  // determine the step based on selected interval
  const step = (() => {
    switch (interval) {
      // 5m probably won't be used, but here for completeness
      case QueryInterval.FIVE_MINUTES:
        return 5 * MINUTE_MILLISECONDS;
      case QueryInterval.FIFTEEN_MINUTES:
        return 15 * MINUTE_MILLISECONDS;
      case QueryInterval.ONE_HOUR:
        return 1 * HOUR_MILLISECONDS;
      // special cases, 1d and 1w intervals get 15m increments of time filter
      case QueryInterval.ONE_DAY:
      case QueryInterval.ONE_WEEK:
        return 15 * MINUTE_MILLISECONDS;
    }
  })()

  return (
    <Slider
      value={value}
      min={0}
      max={DAY_MILLISECONDS}
      step={step}
      marks={TIME_OF_DAY_MARKS}
      track={isOvernight ? 'inverted' : 'normal'}
      onChange={(evt, value) => onChange(value as RangeSliderValue)}
      onChangeCommitted={(evt, value) => onChange(value as RangeSliderValue)}
    />
  );
}

const realizeRangeSliderValue = (rangeSliderValue: RangeSliderValue, isOvernight: boolean): [TimeOfDay, TimeOfDay] => {
  const [left, right] = rangeSliderValue;
  let start: number;
  let end: number;
  if (isOvernight) {
    [start, end] = [right, left]
  } else {
    [start, end] = [left, right]
  }
  return [
    millisecondsToTimeOfDay(start),
    millisecondsToTimeOfDay(end),
  ]
}

/**
 * Formats a TimeOfDay object to show hours, minutes, and meridiem (eg. 12:34pm)
 */
function formatTimeOfDay12Hour(timeOfDay: TimeOfDay) {

  const displayedHour = timeOfDay.hour === 0 ? 12 : timeOfDay.hour > 12 ? timeOfDay.hour - 12 : timeOfDay.hour;

  // In this case we just want the minimum number of digits... (eg. 8:15 rather than 08:15)
  const hourString = displayedHour.toString(10);
  // ...but here we need minutes to always have 2 digits (so we prepend a zero, then slice to 2 digits)
  const minuteString = `0${timeOfDay.minute.toString(10)}`.slice(-2);
  // "am" if hour is less than 12, "pm" otherwise, except the special case of hour == 24, which is "am" again
  const meridiem = timeOfDay.hour === 24 ? 'am' : timeOfDay.hour >= 12 ? 'pm' : 'am';
  return `${hourString}:${minuteString}${meridiem}`;
}

function realizeDaysListFromToggles(dayToggles: ControlBarTimeFilterState['dayToggles']): DayOfWeek[] {
  return DAYS_OF_WEEK.reduce((days: DayOfWeek[], day) => {
    if (dayToggles[day]) {
      days.push(day);
    }
    return days;
  }, [])
}

function getInitialState(timeFilter: TimeFilter[0]): ControlBarTimeFilterState {
  const start = timeOfDayToMilliseconds(timeFilter.start);
  const end = timeOfDayToMilliseconds(timeFilter.end);
  let isOvernight: boolean;
  let sliderValue: RangeSliderValue;
  if (start > end) {
    sliderValue = [end, start]
    isOvernight = true;
  } else {
    sliderValue = [start, end]
    isOvernight = false;
  }
  return {
    sliderValue,
    isOvernight,
    dayToggles: DAYS_OF_WEEK.reduce((dayToggles, day) => {
      dayToggles[day] = timeFilter.days.includes(day)
      return dayToggles;
    }, {} as ControlBarTimeFilterState['dayToggles'])
  }
}

const actions = {
  reset: () => {
    return {
      type: 'RESET' as const
    }
  },
  toggleOvernight: () => {
    return {
      type: 'TOGGLE_OVERNIGHT' as const
    }
  },
  setSliderValue: (value: RangeSliderValue) => {
    return {
      type: 'SET_SLIDER_VALUE' as const,
      value
    }
  },
  toggleDayOfWeek: (dayOfWeek: DayOfWeek) => {
    return {
      type: 'TOGGLE_DAY_OF_WEEK' as const,
      dayOfWeek,
    }
  }
}

type ControlBarTimeFilterState = {
  sliderValue: RangeSliderValue,
  isOvernight: boolean,
  dayToggles: {
    'Sunday': boolean,
    'Monday': boolean,
    'Tuesday': boolean,
    'Wednesday': boolean,
    'Thursday': boolean,
    'Friday': boolean,
    'Saturday': boolean,
  }
}
type ControlBarTimeFilterAction = ReturnType<typeof actions[keyof typeof actions]>;

const DEFAULT_TIME_FILTER_STATE: ControlBarTimeFilterState = {
  sliderValue: [0, DAY_MILLISECONDS],
  isOvernight: false,
  dayToggles: {
    'Sunday': true,
    'Monday': true,
    'Tuesday': true,
    'Wednesday': true,
    'Thursday': true,
    'Friday': true,
    'Saturday': true,
  },
}

function reducer(state: ControlBarTimeFilterState, action: ControlBarTimeFilterAction) {
  switch (action.type) {
    case 'RESET':
      return {
        ...DEFAULT_TIME_FILTER_STATE
      }
    case 'SET_SLIDER_VALUE':
      return {
        ...state,
        sliderValue: action.value,
      }
    case 'TOGGLE_OVERNIGHT':
      return {
        ...state,
        isOvernight: !state.isOvernight
      }
    case 'TOGGLE_DAY_OF_WEEK':
      return {
        ...state,
        dayToggles: {
          ...state.dayToggles,
          [action.dayOfWeek]: !state.dayToggles[action.dayOfWeek]
        } 
      }
  }
}

const TimeRangeDisplay: React.FC<{
  start: TimeOfDay,
  end: TimeOfDay,
}> = function TimeRangeDisplay({
  start,
  end,
}) {

  const startTimeString = formatTimeOfDay12Hour(start);
  const endTimeString = formatTimeOfDay12Hour(end);

  return (
    <div className={styles.timeRangeDisplay}>
      <div className={styles.timeRangeDisplayRow}>
        <input
          className={styles.timeRangeDisplayInput}
          type="text"
          disabled={true}
          value={startTimeString}
        />
        <div className={styles.timeRangeDisplayInputSeparator}>{'-'}</div>
        <input
          className={styles.timeRangeDisplayInput}
          type="text"
          disabled={true}
          value={endTimeString}
        />
      </div>
    </div>
  )
}


const TimeFilterDayToggles: React.FC<{
  dayToggles: ControlBarTimeFilterState['dayToggles'],
  onClickDay: (day: DayOfWeek) => void,
}> = function TimeFilterDayToggles({
  dayToggles,
  onClickDay,
}) {
  return (
    <div className={styles.timeFilterDayToggles}>
      {DAYS_OF_WEEK.map(day => (
        <div
          key={day}
          className={classNames(styles.dayOfWeekToggleButton, { [styles.active]: dayToggles[day] })}
          onClick={() => onClickDay(day)}
        >{day.slice(0, 1).toUpperCase()}</div>
      ))}
    </div>
  )
}

const TimeFilterControls: React.FC<{
  value: TimeFilter[0],
  interval: QueryInterval,
  onApply: (value: TimeFilter[0]) => void,
}> = function TimeFilterControls({
  value,
  interval,
  onApply,
}) {

  const [state, dispatch] = useReducer(reducer, getInitialState(value));
  const [valueHasChanged, setValueHasChanged] = useState<boolean>(false);
 
  // HACK: only allow applying when the value is dirty
  useEffect(() => {
    if (!isEqual(getInitialState(value), state)) {
      setValueHasChanged(true);
    } else {
      setValueHasChanged(false);
    }
  }, [state, value])

  const onClickApply = () => {
    const [start, end] = realizeRangeSliderValue(state.sliderValue, state.isOvernight);
    const days = realizeDaysListFromToggles(state.dayToggles);
    onApply({
      start,
      end,
      days,
    });
  }

  const [startTimeOfDay, endTimeOfDay] = realizeRangeSliderValue(state.sliderValue, state.isOvernight)

  return (
    <div className={styles.timeFilterControls} onClick={(evt) => evt.stopPropagation()}>
      
      <Checkbox
        checked={state.isOvernight}
        onChange={() => dispatch(actions.toggleOvernight())}
        color={'#0d183a'}
        label={'Overnight'}
      />

      <TimeFilterSlider
        value={state.sliderValue}
        interval={interval}
        isOvernight={state.isOvernight}
        onChange={value => dispatch(actions.setSliderValue(value))}
      />

      <div className={styles.labeledRow}>
        <div className={styles.labeledRowLabel}>Hours:</div>
        <TimeRangeDisplay
          start={startTimeOfDay}
          end={endTimeOfDay}
        />
      </div>

      <div className={classNames(styles.labeledRow, styles.dayOfWeekRow)}>
        <div className={styles.labeledRowLabel}>Days:</div>
        <TimeFilterDayToggles
          dayToggles={state.dayToggles}
          onClickDay={(day) => dispatch(actions.toggleDayOfWeek(day))}
        />
      </div>
      
      <div className={styles.bottomActions}>
        <div className={styles.buttonReset} onClick={() => dispatch(actions.reset())}>
          <Icons.Reset color={'#0D183A'}/>
          <span>Reset</span>
        </div>
        <Button disabled={!valueHasChanged} type="primary" variant="filled" onClick={onClickApply}>Apply</Button>
      </div>
       
    </div>
  )
}


const AnalyticsControlBarTimeFilter: React.FC<{
  timeFilter?: TimeFilter,
  onApply: (timeFilter: TimeFilter) => void,
}> = function AnalyticsControlBarTimeFilter({
  timeFilter,
  onApply,
}) {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const anchorElement = useRef<HTMLDivElement>(null);

  const onTriggerClick = (evt: React.MouseEvent<HTMLDivElement>) => {
    setIsOpen(true);
  }

  const onPopoverClose = () => {
    setIsOpen(false);
  }

  const firstTimeFilter = (timeFilter || []).slice(0, 1);
  let filterValue: TimeFilter[0];
  if (firstTimeFilter.length) {
    filterValue = firstTimeFilter[0];
  } else {
    filterValue = { ...DEFAULT_TIME_FILTER }
  }

  const isFilterActive = !isEqual(filterValue, DEFAULT_TIME_FILTER);

  const onTimeFilterApply = (value: TimeFilter[0]) => {
    onApply([value]);
    setIsOpen(false);
  }

  return (
    <div className={styles.wrapper} ref={anchorElement}>
      <div className={classNames(styles.timeFilterControlsToggleButton, {[styles.active]: isFilterActive})} onClick={onTriggerClick}>
        <Icons.Clock color={'#0D183A'}/>
      </div>
      <Popover
        open={isOpen}
        onClose={onPopoverClose}
        anchorEl={anchorElement.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <div className={styles.timeFilterControlsOpenWrapper}>
          <TimeFilterControls
            value={filterValue}
            interval={QueryInterval.FIFTEEN_MINUTES}
            onApply={onTimeFilterApply}
          />
        </div>
      </Popover>
    </div>
  );
}

export default AnalyticsControlBarTimeFilter;