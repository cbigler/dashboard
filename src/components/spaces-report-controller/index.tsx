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
import isOutsideRange, { MAXIMUM_DAY_LENGTH } from '../../helpers/date-range-picker-is-outside-range';
import getCommonRangesForSpace from '../../helpers/common-ranges';
import { ISpaceReportControl, SpaceReportControlTypes } from '../../interfaces/space-reports';

// When the user selects a start date, select a range that's this long. THe user can stil ladjust
// the range up to a maximum length of `MAXIMUM_DAY_LENGTH` though.
const INITIAL_RANGE_SELECTION = MAXIMUM_DAY_LENGTH / 2;

export type ReportControllerProps = {
  space: DensitySpace;
  title: string;
  controls: Array<ISpaceReportControl>;
  onUpdateControls: Function;
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
  reports,
  onUpdateControls,
}: ReportControllerProps) {
  return (
    <div>
      <AppBarContext.Provider value="TRANSPARENT">
        <AppBar>
          <AppBarSection>{title}</AppBarSection>
          <AppBarSection>
            {controls.map(control => {
              switch(control.controlType) {
                case SpaceReportControlTypes.DATE:
                  return <SpacesReportDatePicker
                    space={space}
                    key={control.key}
                    date={control.date}
                    onChange={value => onUpdateControls(control.key, value)}
                  />;
                case SpaceReportControlTypes.DATE_RANGE:
                  return <SpacesReportDateRangePicker
                    space={space}
                    key={control.key}
                    startDate={control.startDate}
                    endDate={control.endDate}
                    onChange={value => onUpdateControls(control.key, value)}
                  />;
                case SpaceReportControlTypes.TIME_SEGMENT:
                  return <div>Time Segment</div>;
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
