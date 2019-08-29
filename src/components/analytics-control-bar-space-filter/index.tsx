import React, { useState, useRef, useEffect, Fragment } from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';

import { DensitySpace } from '../../types';
import { SpaceHierarchyDisplayItem } from '../../helpers/space-hierarchy-formatter';
import SPACE_FUNCTION_CHOICES from '../../helpers/space-function-choices';
import filterCollection from '../../helpers/filter-collection';

import SpacePicker from '../space-picker';
import Filter, { FilterBold } from '../analytics-control-bar-filter';
import {
  ItemList,
  ARROW_TEMPLATE,
  MultipleSelectItemList,
  BackButton,
  FilterDeleteButton,
  SubmitButton,
} from '../analytics-control-bar-utilities';

import {
  AppBar,
  AppBarTitle,
  AppBarContext,
  Icons,
  InputBox,
} from '@density/ui';

export type AnalyticsSpaceFilter = {
  field: string,
  values: Array<string>,
}
export const EMPTY_FILTER: AnalyticsSpaceFilter = { field: '', values: [] };

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

const SpaceFilter: React.FunctionComponent<AnalyticsSpaceSelectorProps> = function SpaceFilter(props) {
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

export default SpaceFilter;
