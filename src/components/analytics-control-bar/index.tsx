import React, { useState, Fragment } from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';

// FIXME: move this
import { SPACE_FUNCTION_CHOICES } from '../admin-locations-detail-modules/general-info';
// FIXME: move this

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

function ItemList({choices, onClick}) {
  return (
    <ul className={styles.itemList}>
      {choices.map(choice => (
        <li
          tabIndex={0}
          onClick={() => onClick(choice)}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              onClick(choice);
            }
          }}
        >
          {choice.label}
        </li>
      ))}
    </ul>
  )
}




export type AnalyticsSpaceFilter = {
  field: string,
  values: Array<string>,
}

export type AnalyticsSpaceSelectorProps = {
  spaces: Array<AnalyticsSpaceFilter>,
  onChange: (spaces: Array<AnalyticsSpaceFilter>) => void,
}

enum AnalyticsSpaceSelectorPage {
  List = 'List',
  SpaceName = 'SpaceName',
  SpaceFunction = 'SpaceFunction',
  SpaceType = 'SpaceType',
}

const ANALYTICS_PAGE_TO_LABEL = {
  [AnalyticsSpaceSelectorPage.SpaceFunction]: 'Add by Function',
  [AnalyticsSpaceSelectorPage.SpaceType]: 'Add by Type',
  [AnalyticsSpaceSelectorPage.SpaceName]: 'Add by Space Name',
};

export function AnalyticsSpaceSelector({ spaces, onChange }: AnalyticsSpaceSelectorProps) {
  const [ open, setOpen ] = useState(false);
  const [ page, setPage ] = useState(AnalyticsSpaceSelectorPage.List);
  const [ searchText, setSearchText ] = useState('');

  function onCloseAndReset() {
    setOpen(false);
    setTimeout(() => {
      setPage(AnalyticsSpaceSelectorPage.List);
      setSearchText('');
    }, 250);
  };

  return (
    <Filter
      open={open}
      onOpen={() => setOpen(true)}
      onClose={onCloseAndReset}
      text={<Fragment><FilterBold>Space</FilterBold> is <FilterBold>Orange</FilterBold></Fragment>}
    >
      {page === AnalyticsSpaceSelectorPage.List ? (
        // Show a list of potential filters on the list page
        <div className={styles.popupBodySmall}>
          <ItemList
            choices={
              Object.entries(ANALYTICS_PAGE_TO_LABEL)
              .map(([key, value]) => ({id: key, label: value}))
            }
            onClick={choice => setPage(choice.id)}
          />
        </div>
      ) : (
        // When not on the list page, show a header that allows navigation back to the list page
        <div className={styles.header}>
          <AppBarContext.Provider value="CARD_HEADER">
            <AppBar>
              <AppBarTitle>
                <div
                  role="button"
                  tabIndex={0}
                  className={styles.back}
                  onClick={() => setPage(AnalyticsSpaceSelectorPage.List)}
                >
                  <Icons.ArrowLeft />
                </div>
                {ANALYTICS_PAGE_TO_LABEL[page]}
              </AppBarTitle>
            </AppBar>
          </AppBarContext.Provider>
        </div>
      )}

      {page === AnalyticsSpaceSelectorPage.SpaceFunction ? (
        <Fragment>
          <div className={styles.popupBody}>
            <ItemList
              choices={SPACE_FUNCTION_CHOICES}
              onClick={choice => {
                onCloseAndReset();
                console.log(choice);
              }}
            />
          </div>
        </Fragment>
      ) : null}

      {page === AnalyticsSpaceSelectorPage.SpaceType ? (
        <Fragment>
          <AppBar>
            <InputBox
              type="text"
              placeholder="Search for a space type"
              width="100%"
            />
          </AppBar>
          <div className={styles.popupBody}>
            <ItemList
              choices={[
                {id: 'space', label: 'Campus'},
                {id: 'space', label: 'Building'},
                {id: 'space', label: 'Floor'},
                {id: 'space', label: 'Space'},
              ]}
              onClick={choice => {
                onCloseAndReset();
                console.log(choice);
              }}
            />
          </div>
        </Fragment>
      ) : null}
    </Filter>
  );
}
