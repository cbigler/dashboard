import styles from './styles.module.scss';

import React, { Fragment, useState } from 'react';

import {
  AppBar,
  AppBarSection,
  AppScrollView,
  DatePicker,
  DateRangePicker,
  DashboardReportGrid,
  InputBox,
} from '@density/ui';
import gridVariables from '@density/ui/variables/grid.json';

import { isInclusivelyBeforeDay } from '@density/react-dates';

import { DensitySpace, DensitySpaceHierarchyItem } from '../../types';
import Report from '../report';
import {
  parseISOTimeAtSpace,
  parseFromReactDates,
  formatInISOTime,
  formatForReactDates,
  getCurrentLocalTimeAtSpace,
  prettyPrintHoursMinutes,
} from '../../helpers/space-time-utilities';
import isOutsideRange from '../../helpers/date-range-picker-is-outside-range';
import getCommonRangesForSpace from '../../helpers/common-ranges';
import { ISpaceReportControl, SpaceReportControlTypes, ISpaceReportData } from '../../interfaces/space-reports';
import { getShownTimeSegmentsForSpace, DEFAULT_TIME_SEGMENT_LABEL, parseStartAndEndTimesInTimeSegment } from '../../helpers/time-segments';

import { SPACES_BACKGROUND } from '../spaces';

// When the user selects a start date, select a range that's this long. The user can stil ladjust
// the range up to a maximum length of 92 though
const MAXIMUM_DAY_LENGTH = 92;
const INITIAL_RANGE_SELECTION = MAXIMUM_DAY_LENGTH / 2;

export type ReportControllerProps = {
  space: DensitySpace;
  spaceHierarchy: Array<DensitySpaceHierarchyItem>;
  controls: Array<ISpaceReportControl>;
  onUpdateControls: Function;
  reports: Array<ISpaceReportData>;
}

function SpacesReportDatePicker({
  date,
  space,
  onChange,
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={styles.spacesReportControl}>
      <DatePicker
        anchor="ANCHOR_RIGHT"
        date={formatForReactDates(parseISOTimeAtSpace(date, space), space)}
        onChange={date => onChange(formatForReactDates(parseISOTimeAtSpace(date, space), space))}
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
      />
    </div>
  );
}

function SpacesReportDateRangePicker({
  startDate,
  endDate,
  space,
  onChange,
}) {
  const [focused, setFocused] = useState(null);
  return (
    <div className={styles.spacesReportControl}>
      <DateRangePicker
        startDate={formatForReactDates(parseISOTimeAtSpace(startDate, space), space)}
        endDate={formatForReactDates(parseISOTimeAtSpace(endDate, space), space)}
        onChange={({start, end}) => {
          start = start ?
            formatForReactDates(parseISOTimeAtSpace(start, space).startOf('day'), space) :
            formatForReactDates(parseISOTimeAtSpace(startDate, space), space);
          end = end ?
            formatForReactDates(parseISOTimeAtSpace(end, space).endOf('day'), space) :
            formatForReactDates(parseISOTimeAtSpace(endDate, space).endOf('day'), space);

          // If the user selected over 14 days, then clamp them back to 14 days.
          if (start && end && end.diff(start, 'days') > MAXIMUM_DAY_LENGTH) {
            end = start.clone().add(INITIAL_RANGE_SELECTION-1, 'days');
          }

          // Only update the start and end data if at least one of them has changed
          if (formatInISOTime(start) !== startDate || formatInISOTime(end) !== endDate) {
            onChange(formatInISOTime(start), formatInISOTime(end));
          }
        }}
        focusedInput={focused}
        onFocusChange={focused => setFocused(focused)}
        numberOfMonths={document.body && document.body.clientWidth > gridVariables.screenSmMin ? 2 : 1}
        isOutsideRange={day => isOutsideRange(space, day)}

        commonRanges={getCommonRangesForSpace(space)}
        onSelectCommonRange={({start, end}) => onChange(formatInISOTime(start), formatInISOTime(end))}
      />
    </div>
  );
}

export function SpacesReportController({
  space,
  spaceHierarchy,
  controls,
  reports,
  onUpdateControls,
}: ReportControllerProps) {
  const shownTimeSegments = space ? getShownTimeSegmentsForSpace(space, spaceHierarchy) : [];
  const spaceTimeSegmentLabelsArray = [
    DEFAULT_TIME_SEGMENT_LABEL,
    ...shownTimeSegments.map(i => i.label),
  ];
  return (
    <Fragment>
      <AppBar>
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
                return (
                  <div className={styles.spacesReportControl}>
                    <InputBox
                      type="select"
                      width={280}
                      className={styles.spacesReportControlTimeSegmentBox}
                      value={control.timeSegment}
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
                                getCurrentLocalTimeAtSpace(space).startOf('day').add(startSeconds, 'seconds')
                              )} - ${prettyPrintHoursMinutes(
                                getCurrentLocalTimeAtSpace(space).startOf('day').add(endSeconds, 'seconds')
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
                      onChange={value => onUpdateControls(control.key, value)}
                    />
                  </div>
                );
              default:
                return <div>Unknown Control</div>;
            }
          })}
        </AppBarSection>
      </AppBar>
      <AppScrollView backgroundColor={SPACES_BACKGROUND}>
        <div style={{padding: '12px 24px'}}>
          <DashboardReportGrid
            reports={reports.map(report => {
              return {
                id: report.configuration.id,
                report: report.status === 'COMPLETE' ? <Report
                  report={report.configuration}
                  reportData={{
                    state: 'COMPLETE',
                    data: report.data,
                    error: null
                  }}
                  expanded={true}
                /> : null
              };
            })}
          />
        </div>
      </AppScrollView>
    </Fragment>
  );
}

export default React.memo(SpacesReportController);
