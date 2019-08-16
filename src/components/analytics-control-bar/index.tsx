import React, { useState, useRef, Fragment } from 'react';
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


export default function AnalyticsControlBar({
  filters,
  onChangeFilters,

  spaces,
  formattedHierarchy,
}) {
  return (
    <AppBar>
      <AppBarSection>
        <div className={styles.analyticsSpaceFilterList}>
          <AnalyticsSpaceFilterBuilder
            filters={filters}
            onChange={onChangeFilters}
            spaces={spaces}
            formattedHierarchy={formattedHierarchy}
          />
        </div>
      </AppBarSection>
    </AppBar>
  );
}

function AnalyticsSpaceFilterBuilder({ filters, onChange, spaces, formattedHierarchy }) {
  const lastSpaceFilter = useRef();
  return (
    <div className={styles.analyticsSpaceFilterList} aria-label="Space filter list">
      {filters.map((filter, index) => (
        <div className={styles.analyticsSpaceFilterListItem}>
          <AnalyticsSpaceSelector
            ref={index === filters.length-1 ? lastSpaceFilter : undefined}
            filter={filter}
            deletable={filters.length > 1}
            onChange={filter => {
              const filtersCopy = filters.slice();
              filtersCopy[index] = filter;
              onChange(filtersCopy);
            }}
            onDelete={() => {
              const filtersCopy = filters.slice();
              filtersCopy.splice(index, 1);
              onChange(filtersCopy);
            }}
            onClose={() => {
              const fieldIsEmpty = filter.field === '' || filter.values.length === 0;
              if (fieldIsEmpty) {
                // No data was put into the field when the popup was open, so remove it from the list.
                if (filters.length === 1) {
                  // If there was a single field, then reset the field to be an empty field so that
                  // the empty state is maintained.
                  setTimeout(() => {
                    onChange([{field: '', values: []}]);
                  }, 250);
                } else {
                  // Otherwise, remove the filter.
                  const filtersCopy = filters.slice();
                  filtersCopy.splice(index, 1);
                  onChange(filtersCopy);
                }
              }
            }}
            spaces={spaces}
            formattedHierarchy={formattedHierarchy}
          />
        </div>
      )).reduce((acc, i) => acc ? <Fragment>{acc} and {i}</Fragment> : i, null)}
      <AddButton onClick={() => {
        // Don't add a new filter if there is a single empty filter already as part of the "empty state"
        const isSingleEmptyFilter = filters.length === 1 && filters[0].field === '';
        if (!isSingleEmptyFilter) {
          onChange([ ...filters, { field: '', values: [] } ]);
        }

        // Focus the last space filter that is visible, it is delayed so that it will happen on the
        // next render after the above onChange is processed.
        setTimeout(() => {
          lastSpaceFilter.current.focus();
        }, 100);
      }} />
    </div>
  );
}


export enum RangeType {
  ABSOLUTE = 'ABSOLUTE',
  RELATIVE = 'RELATIVE',
}

export enum RelativeTimeframe {
  TODAY = 'TODAY',
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
  timeRange: RelativeTimeframe,
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
          if (choice.id === 'ABSOLUTE') {
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




export type AnalyticsSpaceFilter = {
  field: string,
  values: Array<string | null>,
}
const EMPTY_FILTER = { field: '', values: [] };

export type AnalyticsSpaceSelectorProps = {
  filter: AnalyticsSpaceFilter,
  onChange: (filter: AnalyticsSpaceFilter) => void,
  onDelete: () => void,
  onClose: () => void,

  spaces: Array<DensitySpace>,
  hierarchy: Array<SpaceHierarchyDisplayItem>,
  deletable: boolean,
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

export const AnalyticsSpaceSelector = React.forwardRef((props: AnalyticsSpaceSelectorProps, forwardedRef) => {
  const {
    filter,
    onChange,

    deletable,
    onDelete,

    spaces,
    formattedHierarchy,

    // Passed through from the `Filter` component
    onClose,
  } = props;

  const [ open, setOpen ] = useState(false);
  const [ deleteButtonVisible, setDeleteButtonVisible ] = useState(false);
  const [ searchText, setSearchText ] = useState('');

  const deleteButtonWrapperRef = useRef();

  const nameFormattingFunction = ANALYTICS_FIELD_TYPE_TO_FORMATTING_FUNCTION[filter.field] || (n => n);

  let text = <FilterBold>Select your Spaces</FilterBold>;
  if (filter.values.length > 0) {
    const valueList = (
      <Fragment>
        {filter.values.slice(0, 2).reduce((acc, name) => {
          if (!acc) {
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
        ref={forwardedRef}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => {
          setOpen(false);
          if (onClose) {
            onClose();
          }
        }}
        text={text}
        onMouseEnter={() => deletable && setDeleteButtonVisible(true)}
        onMouseLeave={e => {
          // Hide the delete button if the mouse is not moving into it
          const elementMouseMovingInto = e.relatedTarget;
          if (deletable && elementMouseMovingInto !== deleteButtonWrapperRef.current) {
            setDeleteButtonVisible(false);
          }
        }}
      >
        {filter.field === '' ? (
          // Show a list of potential filters on the list page
          <div className={styles.popupBodySmall}>
            <ItemList
              choices={
                Object.entries(ANALYTICS_FIELD_TYPE_TO_LABEL)
                .map(([key, value]) => ({id: key, label: value}))
              }
              onClick={choice => onChange({ field: choice.id, values: [] })}
            />
          </div>
        ) : (
          // When not on the list page, show a header that allows navigation back to the list page
          <div className={styles.header}>
            <AppBarContext.Provider value="CARD_HEADER">
              <AppBar>
                <AppBarTitle>
                  <div className={styles.back}>
                    <BackButton onClick={() => onChange(EMPTY_FILTER)} />
                  </div>
                  {ANALYTICS_FIELD_TYPE_TO_LABEL[filter.field]}
                </AppBarTitle>
              </AppBar>
            </AppBarContext.Provider>
          </div>
        )}

        {filter.field === 'function' ? (
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
                value={filter.values}
                onChange={values => onChange({ ...filter, values })}
              />
            </div>
          </Fragment>
        ) : null}

        {filter.field === 'spaceType' ? (
          <div className={styles.popupBody}>
            <MultipleSelectItemList
              choices={[
                {id: 'campus', label: `Campus (${spaces.filter(s => s.spaceType === 'campus').length})`},
                {id: 'building', label: `Building (${spaces.filter(s => s.spaceType === 'building').length})`},
                {id: 'floor', label: `Floor (${spaces.filter(s => s.spaceType === 'floor').length})`},
                {id: 'space', label: `Space (${spaces.filter(s => s.spaceType === 'space').length})`},
              ]}
              value={filter.values}
              onChange={values => onChange({ ...filter, values })}
            />
          </div>
        ) : null}

        {filter.field === 'id' ? (
          <SpacePicker
            canSelectMultiple
            formattedHierarchy={formattedHierarchy}
            value={filter.values}
            onChange={hierarchyItems => onChange({ ...filter, values: hierarchyItems.map(i => i.space.id) })}
            height={400}
          />
        ) : null}

        {filter.field !== '' ? (
          <button
            className={styles.submitButton}
            onClick={() => {
              setOpen(false);
              if (onClose) {
                onClose();
              }
            }}
          >
            {/* hack so that focus styles only show when keyboard focuses the control:
                see https://stackoverflow.com/a/45191208/4115328 */}
            <span tabIndex={-1} className={styles.inner}>Add Filter</span>
          </button>
        ) : null}
      </Filter>
    </div>
  );
});
