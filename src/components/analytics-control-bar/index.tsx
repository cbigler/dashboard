import React, { useState, useRef, useEffect, Fragment } from 'react';
import moment from 'moment';
import classnames from 'classnames';
import styles from './styles.module.scss';

// FIXME: Move this into a helper! Point this out in a code review!
import { SPACE_FUNCTION_CHOICES } from '../admin-locations-detail-modules/general-info';
// FIXME: move this
//
import SpacePicker from '../space-picker';

import { SpaceHierarchyDisplayItem } from '../../helpers/space-hierarchy-formatter';
import filterCollection from '../../helpers/filter-collection';
import { DensitySpace } from '../../types';

import Filter, { FilterBold } from './filter';
import {
  ItemList,
  ARROW_TEMPLATE,
  MultipleSelectItemList,
  BackButton,
  AddButton,
  FilterDeleteButton,
  SubmitButton,
} from './utilities';
import AnalyticsIntervalSelector, { AnalyticsInterval } from './interval';

import {
  AppBar,
  AppBarTitle,
  AppBarContext,
  Icons,
  InputBox,
  DateRangePicker,
  DatePicker,
} from '@density/ui';

type AnalyticsControlBarProps = {
  filters: Array<AnalyticsSpaceFilter>,
  onChangeFilters: (filters: Array<AnalyticsSpaceFilter>) => void,

  interval: AnalyticsInterval,
  onChangeInterval: (AnalyticsInterval) => void,

  dateRange: DateRange | null,
  onChangeDateRange: (dateRange: DateRange | null) => void,

  spaces: Array<DensitySpace>,
  formattedHierarchy: Array<SpaceHierarchyDisplayItem>,
}

export default function AnalyticsControlBar({
  filters,
  onChangeFilters,

  interval,
  onChangeInterval,

  dateRange,
  onChangeDateRange,

  spaces,
  formattedHierarchy,
}: AnalyticsControlBarProps) {
  return (
    <div className={styles.analyticsControlBar}>
      <div className={styles.analyticsControlBarSectionWrap}>
        <AnalyticsSpaceFilterBuilder
          filters={filters}
          onChange={onChangeFilters}
          spaces={spaces}
          formattedHierarchy={formattedHierarchy}
        />
        <AnalyticsDateSelector
          value={dateRange}
          onChange={onChangeDateRange}
        />
        <AnalyticsIntervalSelector
          value={interval}
          onChange={onChangeInterval}
        />
      </div>
      <div className={styles.analyticsControlBarSection}>
        {/* FIXME: put actual icons and  buttons here, point this out in a review! */}
        <span style={{marginRight: 8}}><Icons.Star /></span>
        <span style={{marginLeft: 8, marginRight: 8}}><Icons.AddReport /></span>
        <span style={{marginLeft: 8, marginRight: 8}}><Icons.Download /></span>
        <span style={{marginLeft: 8, marginRight: 8}}><Icons.Share /></span>
        <span style={{marginLeft: 8}}><Icons.Code /></span>
      </div>
    </div>
  );
}

type AnalyticsSpaceFilterBuilderProps = {
  filters: Array<AnalyticsSpaceFilter>,
  onChange: (filters: Array<AnalyticsSpaceFilter>) => void,

  spaces: Array<DensitySpace>,
  formattedHierarchy: Array<SpaceHierarchyDisplayItem>,
}

function AnalyticsSpaceFilterBuilder({
  filters,
  onChange,
  spaces,
  formattedHierarchy,
}: AnalyticsSpaceFilterBuilderProps) {
  const [ openedFilterIndex, setOpenedFilterIndex ] = useState(-1);
  return (
    <Fragment>
      {filters.map((filter, index) => (
        <div className={styles.analyticsSpaceFilterListItem} aria-label="Space filter">
          <AnalyticsSpaceSelector
            filter={filter}
            deletable={filters.length > 1 || filter.field !== ''}
            onDelete={() => {
              if (filters.length === 1) {
                // If the last filter is being deleted, then replace it with an empty filter.
                onChange([EMPTY_FILTER]);
              } else {
                const filtersCopy = filters.slice();
                filtersCopy.splice(index, 1);
                onChange(filtersCopy);
              }
            }}
            open={openedFilterIndex === index}
            onOpen={() => setOpenedFilterIndex(index)}
            onClose={filter => {
              const filtersCopy = filters.slice();
              filtersCopy[index] = filter;
              onChange(filtersCopy);

              // Close the currently open filter
              setOpenedFilterIndex(-1);

              // Waits to change the fields array until after the popup has been closed to get
              // around weird visual artifacts
              setTimeout(() => {
                const fieldIsEmpty = filter.field === '' || filter.values.length === 0;
                if (fieldIsEmpty) {
                  // No data was put into the field when the popup was open, so remove it from the list.
                  if (filters.length === 1) {
                    // If there was a single field, then reset the field to be an empty field so that
                    // the empty state is maintained.
                    setTimeout(() => {
                      onChange([EMPTY_FILTER]);
                    }, 250);
                  } else {
                    // Otherwise, remove the filter.
                    const filtersCopy = filters.slice();
                    filtersCopy.splice(index, 1);
                    onChange(filtersCopy);
                  }
                }
              }, 100);
            }}
            spaces={spaces}
            formattedHierarchy={formattedHierarchy}
          />
        </div>
      )).reduce((acc: React.ReactNode, i) => acc ? <Fragment>{acc} and {i}</Fragment> : i, null)}
      <AddButton onClick={() => {
        let openedFilterIndex = filters.length - 1;

        // Don't add a new filter if there is a single empty filter already as part of the "empty state"
        const isSingleEmptyFilter = filters.length === 1 && filters[0].field === '';
        if (!isSingleEmptyFilter) {
          const newFilters = [ ...filters, { field: '', values: [] } ];
          onChange(newFilters);
          openedFilterIndex = newFilters.length - 1;
        }

        // Focus the last space filter that is visible, it is delayed so that it will happen on the
        // next render after the above onChange is processed ans so that the animation to open is
        // shown.
        setTimeout(() => {
          setOpenedFilterIndex(openedFilterIndex);
        }, 100);
      }} />
    </Fragment>
  );
}



export type AnalyticsSpaceFilter = {
  field: string,
  values: Array<string>,
}
const EMPTY_FILTER: AnalyticsSpaceFilter = { field: '', values: [] };

type AnalyticsSpaceSelectorProps = {
  filter: AnalyticsSpaceFilter,

  deletable?: boolean,
  onDelete?: () => void,

  open: boolean,
  onOpen: () => void,
  onClose: (AnalyticsSpaceFilter) => void,

  spaces: Array<DensitySpace>,
  formattedHierarchy: Array<SpaceHierarchyDisplayItem>,
}

const ANALYTICS_FIELD_TYPE_TO_LABEL = {
  'function': 'Add by Function',
  spaceType: 'Add by Type',
  id: 'Add by Space Name',
};

const ANALYTICS_FIELD_TYPE_TO_FORMATTING_FUNCTION: { [key: string]: (value: string, formattedHierarchy: Array<SpaceHierarchyDisplayItem>) => string } = {
  'function': spaceFunction => {
    const choice = SPACE_FUNCTION_CHOICES.find(i => i.id === spaceFunction);
    return choice ? choice.label : '(unknown function)';
  },
  spaceType: spaceType => ({
    campus: 'Campus',
    building: 'Building',
    floor: 'Floor',
    space: 'Space',
  }[spaceType] || '(unknown type)'),
  id: (id, formattedHierarchy) => {
    const hierarchyItem = formattedHierarchy.find(i => i.space.id === id);
    return hierarchyItem ? hierarchyItem.space.name : '(unknown space)';
  },
};

const choiceFilter = filterCollection({fields: ['label']});

function AnalyticsSpaceSelectorText({ filter, formattedHierarchy }) {
  const nameFormattingFunction = ANALYTICS_FIELD_TYPE_TO_FORMATTING_FUNCTION[filter.field] || (n => n);

  let text = <FilterBold>Select your Spaces</FilterBold>;
  if (filter.values.length > 0) {
    const valueList = (
      <Fragment>
        {filter.values.slice(0, 2).reduce((acc: React.ReactNode, name) => {
          if (!name) {
            return null;
          } else if (!acc) {
            return (
              <FilterBold>{nameFormattingFunction(name, formattedHierarchy)}</FilterBold>
            );
          } else {
            return (
              <Fragment>
                {acc}, <FilterBold>{nameFormattingFunction(name, formattedHierarchy)}</FilterBold>
              </Fragment>
            )
          }
        }, null)}
        {filter.values.length > 2 ? (
          <Fragment>
            , and{' '}
            <FilterBold>
              {filter.values.length-2} {filter.values.length-2 === 1 ? 'other' : 'others'}
            </FilterBold>
          </Fragment>
        ) : null}
      </Fragment>
    );
    switch (filter.field) {
    case 'function':
      text = (
        <Fragment>
          <FilterBold>Function</FilterBold> is {valueList}
        </Fragment>
      );
      break;
    case 'spaceType':
      text = (
        <Fragment>
          <FilterBold>Type</FilterBold> is {valueList}
        </Fragment>
      );
      break;
    case 'id':
      text = (
        <Fragment>
          <FilterBold>Space</FilterBold> is {valueList}
        </Fragment>
      );
      break;
    }
  }
  return text;
}

export function AnalyticsSpaceSelector(props: AnalyticsSpaceSelectorProps) {
  const {
    filter,

    deletable = false,
    onDelete = () => {},

    open,
    onOpen,
    onClose,

    spaces,
    formattedHierarchy,
  } = props;

  const deleteButtonWrapperRef = useRef<HTMLDivElement | null>(null);

  const [ deleteButtonVisible, setDeleteButtonVisible ] = useState(false);
  const [ searchText, setSearchText ] = useState('');

  // Store a "working" copy of the filter so that it can be modified within the component and then
  // after being updated, it can be sent back to the parent context from within the `onClose`
  // callback.
  const [ workingFilter, setWorkingFilter ] = useState(EMPTY_FILTER);
  useEffect(() => {
    if (open) {
      // When the popup is opened, initialize the working copy of the filter state from the prop
      // value
      setWorkingFilter(filter);
    }
  }, [open, filter]);

  const filterBeingCreated = filter.field === '' && filter.values.length === 0;

  return (
    <div className={styles.spaceSelectorWrapper}>
      {/* A delete button is visible to the left of this filter */}
      {deletable ? (
        <div
          ref={deleteButtonWrapperRef}
          className={classnames(
            styles.deleteButtonWrapper,
            {[styles.visible]: deleteButtonVisible}
          )}
          onMouseLeave={() => setDeleteButtonVisible(false)}
        >
          <FilterDeleteButton
            onClick={onDelete}
            onFocus={() => setDeleteButtonVisible(true)}
            onBlur={() => setDeleteButtonVisible(false)}
          />
        </div>
      ) : null}

      <Filter
        open={open}
        onOpen={() => onOpen()}
        onClose={() => onClose(filter)}
        text={<AnalyticsSpaceSelectorText filter={filter} formattedHierarchy={formattedHierarchy} />}
        onMouseEnter={() => deletable && setDeleteButtonVisible(true)}
        onMouseLeave={e => {
          // Hide the delete button if the mouse is not moving into it
          const elementMouseMovingInto = e.relatedTarget;
          if (deletable && elementMouseMovingInto !== deleteButtonWrapperRef.current) {
            setDeleteButtonVisible(false);
          }
        }}
      >
        {workingFilter.field === '' ? (
          // Show a list of potential filters on the list page
          <div className={styles.popupBodySmall}>
            <ItemList
              template={ARROW_TEMPLATE}
              choices={
                Object.entries(ANALYTICS_FIELD_TYPE_TO_LABEL)
                .map(([key, value]) => ({id: key, label: value}))
              }
              onClick={choice => setWorkingFilter({ field: choice.id, values: [] })}
            />
          </div>
        ) : (
          // When not on the list page, show a header that allows navigation back to the list page
          <div className={styles.header}>
            <AppBarContext.Provider value="CARD_HEADER">
              <AppBar>
                <AppBarTitle>
                  <div className={styles.back}>
                    <BackButton onClick={() => setWorkingFilter(EMPTY_FILTER)} />
                  </div>
                  {ANALYTICS_FIELD_TYPE_TO_LABEL[workingFilter.field].replace(/Add by/g, filterBeingCreated ? 'Add by' : 'Update')}
                </AppBarTitle>
              </AppBar>
            </AppBarContext.Provider>
          </div>
        )}

        {workingFilter.field === 'function' ? (
          <Fragment>
            <AppBar>
              <InputBox
                type="text"
                placeholder="Search for a space function"
                width="100%"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                leftIcon={<Icons.Search />}
              />
            </AppBar>
            <div className={styles.popupBody}>
              <MultipleSelectItemList
                choices={
                  choiceFilter(SPACE_FUNCTION_CHOICES, searchText)
                  .map(choice => ({
                    ...choice,
                    label: `${choice.label} (${spaces.filter(s => s['function'] === choice.id).length})`,
                  }))
                }
                value={workingFilter.values}
                onChange={values => setWorkingFilter({ ...workingFilter, values })}
              />
            </div>
          </Fragment>
        ) : null}

        {workingFilter.field === 'spaceType' ? (
          <div className={styles.popupBody}>
            <MultipleSelectItemList
              choices={[
                {id: 'campus', label: `Campus (${spaces.filter(s => s.spaceType === 'campus').length})`},
                {id: 'building', label: `Building (${spaces.filter(s => s.spaceType === 'building').length})`},
                {id: 'floor', label: `Floor (${spaces.filter(s => s.spaceType === 'floor').length})`},
                {id: 'space', label: `Space (${spaces.filter(s => s.spaceType === 'space').length})`},
              ]}
              value={workingFilter.values}
              onChange={values => setWorkingFilter({ ...workingFilter, values })}
            />
          </div>
        ) : null}

        {workingFilter.field === 'id' ? (
          <SpacePicker
            canSelectMultiple
            formattedHierarchy={formattedHierarchy}
            value={workingFilter.values}
            onChange={hierarchyItems => setWorkingFilter({ ...workingFilter, values: hierarchyItems.map(i => i.space.id) })}
            height={400}
          />
        ) : null}

        {workingFilter.field !== '' ? (
          <SubmitButton
            onClick={() => {
              if (workingFilter.field !== '' && workingFilter.values.length > 0) {
                onClose(workingFilter);
              } else {
                onClose(filter);
              }
            }}
            disabled={workingFilter.values.length === 0}
          >
            {filterBeingCreated ? 'Add' : 'Update'} Filter
          </SubmitButton>
        ) : null}
      </Filter>
    </div>
  );
}



enum RangeType {
  ABSOLUTE = 'ABSOLUTE',
  RELATIVE = 'RELATIVE',
}

enum RelativeUnit {
  DAYS = 'days',
  WEEKS = 'weeks',
  MONTHS = 'months',
  QUARTERS = 'quarters',
  YEARS = 'years',
}

enum RelativeDurationRound {
  NONE = null,
  START = 'START',
  END = 'END',
}

type RelativeDuration = {
  magnitude: number,
  unit: RelativeUnit,
  round: RelativeDurationRound,
}

type RelativeDateRange = {
  type: RangeType.RELATIVE,
  start: RelativeDuration,
  end: RelativeDuration,
  label?: string,
}

type AbsoluteDateRange = {
  type: RangeType.ABSOLUTE,
  start: string,
  end: string,
}

type DateRange = AbsoluteDateRange | RelativeDateRange;

function makeDuration(magnitude, unit, round=RelativeDurationRound.NONE): RelativeDuration {
  return { magnitude, unit, round };
}

export const DATE_RANGES = {
  TODAY: {
    label: 'Today',
    type: RangeType.RELATIVE,
    start: makeDuration(0, RelativeUnit.DAYS, RelativeDurationRound.START),
    end: makeDuration(0, RelativeUnit.DAYS, RelativeDurationRound.END),
  },
  LAST_7_DAYS: {
    label: 'Last 7 Days',
    type: RangeType.RELATIVE,
    start: makeDuration(7, RelativeUnit.DAYS),
    end: makeDuration(0, RelativeUnit.DAYS),
  },
  LAST_WEEK: {
    label: 'Last Week',
    type: RangeType.RELATIVE,
    start: makeDuration(1, RelativeUnit.WEEKS, RelativeDurationRound.START),
    end: makeDuration(1, RelativeUnit.WEEKS, RelativeDurationRound.END),
  },
  WEEK_TO_DATE: {
    label: 'Week-to-Date',
    type: RangeType.RELATIVE,
    start: makeDuration(0, RelativeUnit.WEEKS, RelativeDurationRound.START),
    end: makeDuration(0, RelativeUnit.DAYS),
  },
  LAST_30_DAYS: {
    label: 'Last 30 Days',
    type: RangeType.RELATIVE,
    start: makeDuration(30, RelativeUnit.DAYS),
    end: makeDuration(0, RelativeUnit.DAYS),
  },
  LAST_MONTH: {
    label: 'Last Month',
    type: RangeType.RELATIVE,
    start: makeDuration(1, RelativeUnit.MONTHS, RelativeDurationRound.START),
    end: makeDuration(1, RelativeUnit.MONTHS, RelativeDurationRound.END),
  },
  MONTH_TO_DATE: {
    label: 'Month-to-Date',
    type: RangeType.RELATIVE,
    start: makeDuration(0, RelativeUnit.MONTHS, RelativeDurationRound.START),
    end: makeDuration(0, RelativeUnit.DAYS),
  },
  LAST_90_DAYS: {
    label: 'Last 90 Days',
    type: RangeType.RELATIVE,
    start: makeDuration(90, RelativeUnit.DAYS),
    end: makeDuration(0, RelativeUnit.DAYS),
  },

  // Future time range example, not needed for analytics but an example of how we'd do this
  NEXT_WEEK: {
    label: 'Next Week',
    type: RangeType.RELATIVE,
    start: makeDuration(-1, RelativeUnit.WEEKS, RelativeDurationRound.START),
    end: makeDuration(-1, RelativeUnit.WEEKS, RelativeDurationRound.END),
  },
  NEXT_7_DAYS: {
    label: 'Next 7 Days',
    type: RangeType.RELATIVE,
    start: makeDuration(-7, RelativeUnit.DAYS),
    end: makeDuration(0, RelativeUnit.DAYS),
  },
};

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function realizeDateRange(
  dateRange: DateRange,
  timeZone: string,
  organizationalWeekStartDay="Sunday",
): {startDate: moment, endDate: moment} {
  const now = moment.tz(timeZone);
  if (dateRange.type === RangeType.ABSOLUTE) {
    return {
      startDate: moment.tz(dateRange.start, timeZone).startOf('day'),
      endDate: moment.tz(dateRange.end, timeZone).endOf('day'),
    };
  } else {
    return {
      startDate: realizeRelativeDuration(dateRange.start, now, organizationalWeekStartDay).startOf('day'),
      endDate: realizeRelativeDuration(dateRange.end, now, organizationalWeekStartDay).endOf('day'),
    };
  }
}

function realizeRelativeDuration(
  relativeDuration: RelativeDuration,
  now: moment,
  organizationalWeekStartDay: string,
): moment {
  let timestamp = now.clone().subtract(relativeDuration.magnitude, relativeDuration.unit);
  // Weeks are a special case because of "organization days of week start day" being a a concept
  // that can effect what day a week starts on
  if (relativeDuration.unit === RelativeUnit.WEEKS) {
    timestamp = timestamp.add(DAYS_OF_WEEK.indexOf(organizationalWeekStartDay), 'days');
  }
  switch (relativeDuration.round) {
  case RelativeDurationRound.START:
    return timestamp.startOf(relativeDuration.unit);
  case RelativeDurationRound.END:
    return timestamp.endOf(relativeDuration.unit);
  case RelativeDurationRound.NONE:
  default:
    return timestamp;
  }
}

// console.log(DATE_RANGES)
// console.log('NOW:', moment.tz('America/New_York').format())
// for (let key in DATE_RANGES) {
//   const timeRangeStructure = DATE_RANGES[key];
//   const realizedDateRange = realizeDateRange(timeRangeStructure, 'America/New_York');
//   console.log(key, realizedDateRange.startDate.format(), realizedDateRange.endDate.format());
// }

enum AnalyticsDateSelectorPages {
  LIST = 'LIST',
  CUSTOM = 'CUSTOM',
}

enum AnalyticsCustomDateRangeChoices {
  BETWEEN = 'between',
  ON = 'on',
}

const BETWEEN_DEFAULT_RANGE: DateRange = {
  type: RangeType.ABSOLUTE,
  startDate: moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD'),
  endDate: moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD'),
};

const ON_DEFAULT_RANGE: DateRange = {
  type: RangeType.ABSOLUTE,
  startDate: moment().format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD'),
};

function DateSelectorCustom({ workingDateRange, setWorkingDateRange, onSubmit }) {
  const [ dateRangeFocused, setDateRangeFocused ] = useState('startDate');
  const [ customDateRangeType, setCustomDateRangeType ] = useState(AnalyticsCustomDateRangeChoices.BETWEEN);

  useEffect(() => {
    // Figure out the custom date range type if the custom page is visible
    if (workingDateRange && workingDateRange.type === RangeType.ABSOLUTE) {
      setCustomDateRangeType(
        workingDateRange.startDate === workingDateRange.endDate ?
          AnalyticsCustomDateRangeChoices.ON :
          AnalyticsCustomDateRangeChoices.BETWEEN
      );
    }
  }, [ workingDateRange ]);

  return (
    <div className={styles.dateSelectorCustomWrapper}>
      <div className={styles.header}>
        <AppBarContext.Provider value="CARD_HEADER">
          <AppBar>
            <AppBarTitle>
              <div className={styles.back}>
                <BackButton onClick={() => setWorkingDateRange(null)} />
              </div>
              Select a Custom Date Range
            </AppBarTitle>
          </AppBar>
        </AppBarContext.Provider>
      </div>
      <div className={styles.dateSelectorCustomBody}>
        <div className={styles.dateSelectorCustomBodyItem}>
          <InputBox
            type="select"
            value={customDateRangeType}
            choices={[
              { id: AnalyticsCustomDateRangeChoices.BETWEEN, label: 'Between' },
              { id: AnalyticsCustomDateRangeChoices.ON, label: 'On' },
            ]}
            onChange={choice => {
              setCustomDateRangeType(choice.id);

              switch (choice.id) {
              case AnalyticsCustomDateRangeChoices.BETWEEN:
                setWorkingDateRange(BETWEEN_DEFAULT_RANGE);
                break;
              case AnalyticsCustomDateRangeChoices.ON:
                setWorkingDateRange(ON_DEFAULT_RANGE);
                break;
              }
            }}
            width="100%"
          />
        </div>
        <div
          className={styles.dateSelectorCustomBodyItem}
          style={{flexGrow: 1, flexShrink: 1}}

          // Block focus / blur events from effecting the filter popup logic
          onFocus={e => e.stopPropagation()}
          onBlur={e => e.stopPropagation()}
        >
          {customDateRangeType === AnalyticsCustomDateRangeChoices.BETWEEN ? (
            <DateRangePicker
              focusedInput={dateRangeFocused}
              onFocusChange={focus => {
                if (focus !== null) {
                  setDateRangeFocused(focus);
                }
              }}
              startDate={workingDateRange.startDate ? moment(workingDateRange.startDate, 'YYYY-MM-DD') : null}
              endDate={workingDateRange.endDate ? moment(workingDateRange.endDate, 'YYYY-MM-DD') : null}
              onChange={range => {
                if (!range.endDate) {
                  // A date before the start of the selected range was clicked, so use the date
                  // that was selected 
                  setWorkingDateRange({
                    ...workingDateRange,
                    startDate: range.startDate.format('YYYY-MM-DD'),
                    endDate: '',
                  });
                } else {
                  setWorkingDateRange({
                    ...workingDateRange,
                    startDate: range.startDate.format('YYYY-MM-DD'),
                    endDate: range.endDate.format('YYYY-MM-DD'),
                  });
                }
              }}
              numberOfMonths={1}
              isOutsideRange={day => day.clone().startOf('day').isAfter(moment().startOf('day'))}
            />
          ) : (
            <DatePicker
              focused
              onFocusChange={() => {}}
              date={workingDateRange.startDate ? moment(workingDateRange.startDate, 'YYYY-MM-DD') : null}
              onChange={date => {
                setWorkingDateRange({
                  ...workingDateRange,
                  startDate: date.format('YYYY-MM-DD'),
                  endDate: date.format('YYYY-MM-DD'),
                });
              }}
              numberOfMonths={1}
              isOutsideRange={day => day.clone().startOf('day').isAfter(moment().startOf('day'))}
            />
          )}
        </div>
      </div>
      <SubmitButton
        onClick={() => onSubmit(workingDateRange)}
        disabled={!workingDateRange.startDate || !workingDateRange.endDate}
      >
        Select date range
      </SubmitButton>
    </div>
  );
}

const TIMEFRAME_CHOICES: Array<DateRange> = [
  DATE_RANGES.TODAY,
  DATE_RANGES.WEEK_TO_DATE,
  DATE_RANGES.MONTH_TO_DATE,
  DATE_RANGES.LAST_WEEK,
  DATE_RANGES.LAST_MONTH,
  DATE_RANGES.LAST_7_DAYS,
  DATE_RANGES.LAST_30_DAYS,
  DATE_RANGES.LAST_90_DAYS,
]
export function AnalyticsDateSelector({ value, onChange }) {
  const [ open, setOpen ] = useState(false);

  let text = 'No date range selected';
  switch (value && value.type) {
  case RangeType.RELATIVE:
    text = value.label || '(unlabeled relative date range)';
    break;
  case RangeType.ABSOLUTE:
    const start = moment.utc(value.startDate).format('MM/DD/YYYY');
    const end = moment.utc(value.endDate).format('MM/DD/YYYY');
    if (start === end) {
      text = start;
    } else {
      text = `${start} - ${end}`;
    }
    break;
  }

  const [ workingDateRange, setWorkingDateRange ] = useState(TIMEFRAME_CHOICES[0]);

  let activePage;
  if (workingDateRange && workingDateRange.type === RangeType.ABSOLUTE) {
    activePage = AnalyticsDateSelectorPages.CUSTOM;
  } else {
    activePage = AnalyticsDateSelectorPages.LIST;
  }

  return (
    <div className={styles.dateSelector}>
      <span className={styles.dateSelectorLabel}>
        {value && value.type === RangeType.ABSOLUTE ? (
          value.startDate === value.endDate ? 'on' : 'from'
        ) : (
          value && value.label && value.label.startsWith('Last') ? 'in the' : 'from'
        )}
      </span>
      <Filter
        open={open}
        onOpen={() => {
          if (open) { return; }
          setWorkingDateRange(value);
          setOpen(true);
        }}
        onClose={() => setOpen(false)}
        text={<FilterBold>{text}</FilterBold>}
      >
        {activePage === AnalyticsDateSelectorPages.LIST ? (
          <ItemList
            template={ARROW_TEMPLATE}
            choices={[
              ...TIMEFRAME_CHOICES.map(choice => ({id: choice.label, label: choice.label})),
              {id: 'ABSOLUTE', label: 'Custom Date Range'},
            ]}
            onClick={choice => {
              const timeRange = TIMEFRAME_CHOICES.find(c => c.label === choice.id);
              if (timeRange) {
                // An item in the regular list was picked
                onChange(timeRange);
                setOpen(false);
              } else if (choice.id === 'ABSOLUTE') {
                // The "custom date range" choice was picked
                setWorkingDateRange({
                  type: RangeType.ABSOLUTE,
                  startDate: moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD'),
                  endDate: moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD'),
                });
              }
            }}
          />
        ) : null}
        {activePage === AnalyticsDateSelectorPages.CUSTOM ? (
          <DateSelectorCustom
            workingDateRange={workingDateRange}
            setWorkingDateRange={setWorkingDateRange}
            onSubmit={dateRange => {
              onChange(dateRange);
              setOpen(false);
            }}
          />
        ) : null}
      </Filter>
    </div>
  );
}
