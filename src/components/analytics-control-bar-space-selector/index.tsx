import React, { useState, useRef, useEffect, Fragment } from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';

import { DensitySpace } from '../../types';
import { SpaceHierarchyDisplayItem } from '@density/lib-space-helpers/types';
import { SPACE_FUNCTION_CHOICES } from '@density/lib-space-helpers';
import filterCollection from '../../helpers/filter-collection';

import SpacePicker from '../space-picker';
import Selector, { QueryTextBold } from '../analytics-control-bar-selector';
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
} from '@density/ui/src';

export type AnalyticsSpaceSelection = {
  field: string,
  values: Array<string>,
}
export const EMPTY_SELECTION: AnalyticsSpaceSelection = { field: '', values: [] };

type AnalyticsSpaceSelectorProps = {
  selection: AnalyticsSpaceSelection,

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
  space_type: 'Add by Type',
  id: 'Add by Space Name',
};

const ANALYTICS_FIELD_TYPE_TO_FORMATTING_FUNCTION: { [key: string]: (value: string, formattedHierarchy: Array<SpaceHierarchyDisplayItem>) => string } = {
  'function': spaceFunction => {
    const choice = SPACE_FUNCTION_CHOICES.find(i => i.id === spaceFunction);
    return choice ? choice.label : '(unknown function)';
  },
  space_type: spaceType => ({
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

  let text = <QueryTextBold>Select your Spaces</QueryTextBold>;
  if (filter.values.length > 0) {
    const valueList = (
      <Fragment>
        {filter.values.slice(0, 2).reduce((acc: React.ReactNode, name) => {
          if (!acc) {
            return (
              <QueryTextBold>{nameFormattingFunction(name, formattedHierarchy)}</QueryTextBold>
            );
          } else {
            return (
              <Fragment>
                {acc}, <QueryTextBold>{nameFormattingFunction(name, formattedHierarchy)}</QueryTextBold>
              </Fragment>
            )
          }
        }, null)}
        {filter.values.length > 2 ? (
          <Fragment>
            , <span className={styles.label}>and</span> {' '}
            <QueryTextBold>
              {filter.values.length-2} {filter.values.length-2 === 1 ? 'other' : 'others'}
            </QueryTextBold>
          </Fragment>
        ) : null}
      </Fragment>
    );
    switch (filter.field) {
    case 'function':
      text = (
        <Fragment>
          <QueryTextBold>Function:&nbsp;</QueryTextBold> {valueList}
        </Fragment>
      );
      break;
    case 'space_type':
      text = (
        <Fragment>
          <QueryTextBold>Type:&nbsp;</QueryTextBold> {valueList}
        </Fragment>
      );
      break;
    case 'id':
      text = (
        <Fragment>
          <QueryTextBold>Space:&nbsp;</QueryTextBold> {valueList}
        </Fragment>
      );
      break;
    }
  }
  return text;
}

const SpaceSelector: React.FunctionComponent<AnalyticsSpaceSelectorProps> = function SpaceSelector(props) {
  const {
    selection,

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
  const [ workingFilter, setWorkingFilter ] = useState(EMPTY_SELECTION);
  useEffect(() => {
    if (open) {
      // When the popup is opened, initialize the working copy of the filter state from the prop
      // value
      setWorkingFilter(selection);
    }
  }, [open, selection]);

  const filterBeingCreated = selection.field === '' && selection.values.length === 0;

  return (
    <div>
      {/* A delete button is visible to the left of this filter */}
      {deletable ? (
        <div style={{position: 'relative'}}>
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
        </div>
      ) : null}

      <Selector
        open={open}
        onOpen={() => onOpen()}
        onClose={() => onClose(selection)}
        text={<AnalyticsSpaceSelectorText filter={selection} formattedHierarchy={formattedHierarchy} />}
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
                    <BackButton onClick={() => setWorkingFilter(EMPTY_SELECTION)} />
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
                    spaceCount: spaces.filter(s => s['function'] === choice.id).length,
                  }))
                  .filter(i => i.spaceCount > 0)
                  .sort((a, b) => b.spaceCount - a.spaceCount)
                  .map(choice => ({
                    id: choice.id,
                    label: `${choice.label} (${choice.spaceCount})`,
                  }))
                }
                value={workingFilter.values}
                onChange={values => setWorkingFilter({ ...workingFilter, values })}
              />
            </div>
          </Fragment>
        ) : null}

        {workingFilter.field === 'space_type' ? (
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
                onClose(selection);
              }
            }}
            disabled={workingFilter.values.length === 0}
          >
            {filterBeingCreated ? 'Add' : 'Update'} Space Selection
          </SubmitButton>
        ) : null}
      </Selector>
    </div>
  );
}

export default SpaceSelector;
