import React, { useState, Fragment } from 'react';
import styles from './styles.module.scss';
import classnames from 'classnames';

import Filter, { FilterBold } from './filter';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Icons,
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
        <li tabIndex={0} onClick={() => onClick(choice)}>
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

export function AnalyticsSpaceSelector({ spaces, onChange }: AnalyticsSpaceSelectorProps) {
  const [ open, setOpen ] = useState(false);
  const [ page, setPage ] = useState(AnalyticsSpaceSelectorPage.List);
  return (
    <Filter
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => {
        setOpen(false);
        setTimeout(() => {
          setPage(AnalyticsSpaceSelectorPage.List);
        }, 250);
      }}
      text={<Fragment><FilterBold>Space</FilterBold> is <FilterBold>Orange</FilterBold></Fragment>}
    >
      {page === AnalyticsSpaceSelectorPage.List ? (
        <ItemList
          choices={[
            {id: AnalyticsSpaceSelectorPage.SpaceFunction, label: 'Add by Function'},
            {id: AnalyticsSpaceSelectorPage.SpaceType, label: 'Add by Type'},
            {id: AnalyticsSpaceSelectorPage.SpaceName, label: 'Add by Space Name'},
          ]}
          onClick={choice => setPage(choice.id)}
        />
      ) : (
        <div className={styles.header}>
          <AppBarContext.Provider value="CARD_HEADER">
            <AppBar>
              <AppBarTitle>
                <div role="button" tabIndex={0} className={styles.back} onClick={() => setPage(AnalyticsSpaceSelectorPage.List)}>
                  <Icons.ArrowLeft />
                </div>
                Foo
              </AppBarTitle>
            </AppBar>
          </AppBarContext.Provider>
        </div>
      )}
    </Filter>
  );
}
