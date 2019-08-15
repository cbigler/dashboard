import React, { useState, Fragment } from 'react';
import styles from './styles.module.scss';

// FIXME: move this
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
  CircleIconButton,
} from './utilities';

import {
  AppBar,
  AppBarTitle,
  AppBarContext,
  Icons,
  InputBox,
} from '@density/ui';

export default function AnalyticsControlBar() {
  return (
    <AppBar>
      foo
    </AppBar>
  );
}




export function AnalyticsDateSelector({date}) {
  return <p>a</p>;
}




export type AnalyticsSpaceFilter = {
  field: string,
  values: Array<string | null>,
}
const EMPTY_FILTER = { field: '', values: [] };

export type AnalyticsSpaceSelectorProps = {
  filter: AnalyticsSpaceFilter,
  onChange: (filter: AnalyticsSpaceFilter) => void,

  spaces: Array<DensitySpace>,
  hierarchy: Array<SpaceHierarchyDisplayItem>,
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

export function AnalyticsSpaceSelector({ filter, onChange, spaces, formattedHierarchy }: AnalyticsSpaceSelectorProps) {
  const [ open, setOpen ] = useState(false);
  const [ searchText, setSearchText ] = useState('');

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
    <Filter
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      text={text}
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
                  <CircleIconButton onClick={() => onChange(EMPTY_FILTER)}>
                    <Icons.ArrowLeft />
                  </CircleIconButton>
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
        <button className={styles.submitButton} onClick={() => setOpen(false)}>
          {/* hack so that focus styles only show when keyboard focuses the control:
              see https://stackoverflow.com/a/45191208/4115328 */}
          <span tabIndex={-1} className={styles.inner}>Add Filter</span>
        </button>
      ) : null}
    </Filter>
  );
}
