import React, { useState, Fragment } from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';

// FIXME: move this
import { SPACE_FUNCTION_CHOICES } from '../admin-locations-detail-modules/general-info';
// FIXME: move this
import Checkbox from '../checkbox';

import Filter, { FilterBold } from './filter';

import {
  AppBar,
  AppBarSection,
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

function ItemList({choices, template, onClick}) {
  return (
    <ul className={styles.itemList}>
      {choices.map(choice => (
        <li
          tabIndex={0}
          key={choice.id}
          onClick={e => onClick(choice, e)}
          onKeyPress={e => {
            if (e.key === 'Enter' || e.key === 'Space') {
              onClick(choice, e);
            }
          }}
        >
          {template ? template(choice) : choice.label}
        </li>
      ))}
    </ul>
  )
}

function MultipleSelectItemList({choices, value, onChange}) {
  return (
    <ItemList
      choices={choices}
      template={choice => (
        <Fragment>
          <Checkbox
            id={choice.id}
            checked={value.includes(choice.id)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([ ...value, choice.id ]);
              } else {
                onChange(value.filter(i => i !== choice.id));
              }
            }}
          />
          {choice.label}
        </Fragment>
      )}
      onClick={(choice, e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') { return; }
        if (value.includes(choice.id)) {
          onChange(value.filter(i => i !== choice.id));
        } else {
          onChange([ ...value, choice.id ]);
        }
      }}
    />
  );
}

function CircleIconButton({ children, onClick }) {
  return (
    <button className={styles.circleIconButton} onClick={onClick}>
      {children}
    </button>
  );
}




export type AnalyticsSpaceFilter = {
  field: string,
  values: Array<string>,
}
const EMPTY_FILTER = { field: '', values: [] };

export type AnalyticsSpaceSelectorProps = {
  spaces: Array<AnalyticsSpaceFilter>,
  onChange: (spaces: Array<AnalyticsSpaceFilter>) => void,
}

const ANALYTICS_FIELD_TYPE_TO_LABEL = {
  'function': 'Add by Function',
  spaceType: 'Add by Type',
  name: 'Add by Space Name',
};

const ANALYTICS_FIELD_TYPE_TO_FORMATTING_FUNCTION = {
  'function': id => SPACE_FUNCTION_CHOICES.find(i => i.id === id).label,
  spaceType: (spaceType, spaces) => {
    return { campus: 'Campus', building: 'Building', floor: 'Floor', space: 'Space' }[spaceType];
  },
  name: n => n,
};

export function AnalyticsSpaceSelector({ spaces }: AnalyticsSpaceSelectorProps) {
  const [ open, setOpen ] = useState(false);
  const [ searchText, setSearchText ] = useState('');

  const [ filter, onChange ] = useState<AnalyticsSpaceFilter>(EMPTY_FILTER);

  function onCloseAndReset() {
    setOpen(false);
  };

  const nameFormattingFunction = ANALYTICS_FIELD_TYPE_TO_FORMATTING_FUNCTION[filter.field] || (n => n);

  let text = <FilterBold>Select your Spaces</FilterBold>;
  if (filter.values.length > 0) {
    const valueList = (
      <Fragment>
        {filter.values.slice(0, 2).reduce((acc, name) => {
          if (!acc) {
            return (
              <FilterBold>{nameFormattingFunction(name, spaces)}</FilterBold>
            );
          } else {
            return (
              <Fragment>
                {acc}, <FilterBold>{nameFormattingFunction(name)}</FilterBold>
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
    case 'name':
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
      onClose={onCloseAndReset}
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
            />
          </AppBar>
          <div className={styles.popupBody}>
            <MultipleSelectItemList
              choices={
                SPACE_FUNCTION_CHOICES
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
        <Fragment>
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
        </Fragment>
      ) : null}

      {filter.field !== '' ? (
        <button>Add Filter</button>
      ) : null}
    </Filter>
  );
}
