import React, { useState, useRef, useEffect, Fragment } from 'react';
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
} from './utilities';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Icons,
  InputBox,
} from '@density/ui';

type AnalyticsControlBarProps = {
  filters: Array<AnalyticsSpaceFilter>,
  onChangeFilters: (filters: Array<AnalyticsSpaceFilter>) => void,

  interval: AnalyticsInterval,
  onChangeInterval: (AnalyticsInterval) => void,

  spaces: Array<DensitySpace>,
  formattedHierarchy: Array<SpaceHierarchyDisplayItem>,
}

export default function AnalyticsControlBar({
  filters,
  onChangeFilters,

  interval,
  onChangeInterval,

  spaces,
  formattedHierarchy,
}: AnalyticsControlBarProps) {
  return (
    <AppBar>
      <AppBarSection>
        <AnalyticsSpaceFilterBuilder
          filters={filters}
          onChange={onChangeFilters}
          spaces={spaces}
          formattedHierarchy={formattedHierarchy}
        />

        <AnalyticsIntervalSelector
          value={interval}
          onChange={onChangeInterval}
        />
      </AppBarSection>
    </AppBar>
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
    <div className={styles.analyticsSpaceFilterList} aria-label="Space filter list">
      {filters.map((filter, index) => (
        <div className={styles.analyticsSpaceFilterListItem}>
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
    </div>
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
          <button
            className={styles.submitButton}
            onClick={() => {
              if (workingFilter.field !== '' && workingFilter.values.length > 0) {
                onClose(workingFilter);
              } else {
                onClose(filter);
              }
            }}
            disabled={workingFilter.values.length === 0}
          >
            {/* hack so that focus styles only show when keyboard focuses the control:
                see https://stackoverflow.com/a/45191208/4115328 */}
            <span tabIndex={-1} className={styles.inner}>
              {filterBeingCreated ? 'Add' : 'Update'} Filter
            </span>
          </button>
        ) : null}
      </Filter>
    </div>
  );
}


export enum AnalyticsInterval {
  DAY = 'DAY',
  HOUR = 'HOUR',
  FIFTEEN_MINUTES = 'FIFTEEN_MINUTES',
}

const INTERVAL_CHOICES = [
  { id: AnalyticsInterval.DAY, label: 'Day' },
  { id: AnalyticsInterval.HOUR, label: 'Hour' },
  { id: AnalyticsInterval.FIFTEEN_MINUTES, label: '15 Minutes' },
];

export const AnalyticsIntervalSelector = ({ value, onChange }) => {
  const [ open, setOpen ] = useState(false);

  const choice = INTERVAL_CHOICES.find(choice => choice.id === value);

  return (
    <div className={styles.analyticsIntervalSelector}>
      <span className={styles.analyticsIntervalLabel}>by</span>
      <Filter
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        text={<FilterBold>{choice ? choice.label : '(unknown interval)'}</FilterBold>}
      >
        <ItemList
          choices={INTERVAL_CHOICES}
          onClick={choice => {
            onChange(choice.id);
            // Blur the element that was selected if there was a focused element
            if (document.activeElement) { (document.activeElement as HTMLElement).blur(); }
            setOpen(false);
          }}
        />
      </Filter>
    </div>
  );
};



/*
export enum RangeType {
  ABSOLUTE = 'ABSOLUTE',
  RELATIVE = 'RELATIVE',
}

function makeRelativeTimeRange(start: moment, end: moment): DateRange {
  return {
    type: RangeType.RELATIVE,
    start
  }
}

const TIMEFRAME_CHOICES: { [key: string]: DateRange }= {
  'Today': { type: RangeType.RELATIVE, unit:  },
  WEEK_TO_DATE = 'WEEK_TO_DATE',
  MONTH_TO_DATE = 'MONTH_TO_DATE',
  LAST_WEEK = 'LAST_WEEK',
  LAST_MONTH = 'LAST_MONTH',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  LAST_90_DAYS = 'LAST_90_DAYS',
}

const formatRelativeTimeframe = (timeframe: RelativeTimeframe) => {
  switch (timeframe) {
  case RelativeTimeframe.TODAY:
    return 'Today';
  case RelativeTimeframe.LAST_WEEK:
    return 'Last week';
  case RelativeTimeframe.LAST_MONTH:
    return 'Last month';
  case RelativeTimeframe.WEEK_TO_DATE:
    return 'Week to date';
  case RelativeTimeframe.MONTH_TO_DATE:
    return 'Month to date';
  case RelativeTimeframe.LAST_7_DAYS:
    return 'Last 7 days';
  case RelativeTimeframe.LAST_30_DAYS:
    return 'Last 30 days';
  case RelativeTimeframe.LAST_90_DAYS:
    return 'Last 90 days';
  default:
    return 'Unknown'
  }
};

export type DateRange = {
  type: RangeType.ABSOLUTE,
  startDate: string,
  endDate: string,
} | {
  type: RangeType.RELATIVE,
  start: {
    unit: RelativeBasisUnit,
    magnitude: number,
  },
  end: {
    unit: RelativeBasisUnit,
    magnitude: number,
  },
};

export function AnalyticsDateSelector({ value, onChange }) {
  const [ open, setOpen ] = useState(false);
  return (
    <Filter
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      text={<FilterBold>Date will go here</FilterBold>}
    >
      <ItemList
        choices={[
          ...Object.keys(RelativeTimeframe).map(key => ({id: key, label: formatRelativeTimeframe(key)})),
          {id: 'ABSOLUTE', label: 'Custom'},
        ]}
        onClick={choice => {
          if (choice.id === RangeType.ABSOLUTE) {
            onChange({
              type: RangeType.ABSOLUTE,
              startDate: null,
              endDate: null,
            });
          } else {
            onChange({
              type: RangeType.RELATIVE,
              timeRange: choice.id,
            });
            setOpen(false);
          }
        }}
      />
    </Filter>
  )
}
*/
