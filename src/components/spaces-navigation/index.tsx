import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import { CoreSpaceDoorway, CoreSpaceHierarchyNode, CoreSpaceType } from '@density/lib-api-types/core-v2/spaces';
import { spaceHierarchyFormatter, spaceHierarchySearcher } from '@density/lib-space-helpers';
import { AppScrollView, Icons, InputBox, Switch } from '@density/ui/src';

import styles from './styles.module.scss';
import colors from '@density/ui/variables/colors.json';
import { SpacesPageState } from '../../rx-stores/spaces-page/reducer';
import { SpaceIcon } from '../spaces-snippets';
import { SpacesState } from '../../rx-stores/spaces';

export type SpacesNavigationValue = {
  type: 'SPACE',
  space_id: string
} | {
  type: 'DOORWAY',
  space_id: string,
  doorway_id: string
}

export default function SpacesNavigation({
  value,
  spaceDoorways,
  spaceHierarchy,
  spaces,
  spacesPage,
  setShowDoorways,
  setCollapsedSpaces,
  navigateToItem,
  isSpaceDisabled,
}: {
  value: SpacesNavigationValue | null,
  spaceDoorways: Map<string, Array<CoreSpaceDoorway>>,
  spaceHierarchy: Array<CoreSpaceHierarchyNode>,
  spaces: SpacesState,
  spacesPage: SpacesPageState,
  setShowDoorways: (value: boolean) => void,
  setCollapsedSpaces: (value: Set<string>) => void,
  navigateToItem: (item: SpacesNavigationValue) => void,
  isSpaceDisabled: (space: CoreSpaceHierarchyNode) => boolean,
}) {
  
  const [searchText, setSearchText] = useState('');

  // Filter with the search text, and hide collapsed items
  let formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy);
  if (searchText.length > 0) {
    formattedHierarchy = spaceHierarchySearcher(formattedHierarchy, searchText);
  }
  if (spacesPage.collapsedSpaces.size > 0) {
    formattedHierarchy = formattedHierarchy.filter(x => !x.ancestry.map(y => y.id).some(y => spacesPage.collapsedSpaces.has(y)));
  }

  // const matchedSpaceIds = fuzzy.filter<any>(
  //   spacesPage.searchFilter,
  //   Array.from(spaces.data.values()),
  //   { pre: '<', post: '>', extract: x => x['name'] }
  // ).map(x => x.original['id']);
  // formattedHierarchy = formattedHierarchy.filter(x => matchedSpaceIds.includes(x.space.id)).filter(x => x);

  return <div style={{height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: colors.gray100}}>
    <div style={{padding: '12px 16px', backgroundColor: colors.gray100, borderBottom: `1px solid ${colors.gray200}`}}>
      <InputBox
        type="text"
        width="100%"
        placeholder="Search"
        disabled={false}
        leftIcon={<Icons.Search color={colors.gray400} />}
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
      />
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12}}>
        <div style={{display: 'flex', alignItems: 'center', color: colors.gray400}}>
          <Icons.Doorway color={colors.gray} />
          <span style={{fontSize: 14, fontWeight: 600, marginLeft: 8}}>Show doorways</span>
        </div>
        <Switch
          value={spacesPage.showDoorways}
          onChange={e => setShowDoorways(e.target.checked)}
        />
      </div>
    </div>
    <AppScrollView backgroundColor={colors.gray100}>
      {spaces.data.size === 0 ? <div style={{padding: 24, fontSize: 14, fontWeight: 500, color: colors.gray500}}>
        You haven't created any spaces yet.
      </div> : null}
      {formattedHierarchy.map(item => {
        const space = spaces.data.get(item.space.id);
        const spaceDisabled = !item.space.has_purview || isSpaceDisabled(item.space);
        const isSelected = value && value.type === 'SPACE' && item.space.id === value.space_id;
        const canCollapse = item.children.length > 0 || (spacesPage.showDoorways && spaceDoorways && !!spaceDoorways.get(item.space.id))
        const spaceCollapsed = spacesPage.collapsedSpaces.has(item.space.id);

        return <Fragment key={item.space.id}>
          <div
            key={item.space.id}
            className={classnames(styles.item, {
              [styles.depth0]: item.depth === 0,
              [styles.collapsed]: spaceCollapsed,
              [styles.disabled]: spaceDisabled,
            })}
            style={{marginLeft: item.depth * 16}}
            onClick={e => {
              if (!spaceDisabled) { navigateToItem({ type: 'SPACE', space_id: item.space.id }); }
            }}
          >
            {canCollapse ? <div
              style={{width: 16, cursor: 'pointer'}}
              onClick={e => {
                e.stopPropagation();
                const items = new Set(spacesPage.collapsedSpaces);
                items.has(item.space.id) ? items.delete(item.space.id) : items.add(item.space.id);
                setCollapsedSpaces(items);
              }}
            >
              {spaceCollapsed ?
                <Icons.ChevronRight width={18} height={18} color={colors.gray400} /> :
                <Icons.ChevronDown width={18} height={18} color={colors.gray400} />}
            </div> : null}

            {space && item.space.space_type !== CoreSpaceType.CAMPUS ? <span className={styles.itemIcon}>
              <SpaceIcon
                space={space}
                color={isSelected ? colors.blue : colors.gray700}
                small={true} />
            </span> : null}
            {space ? <span
              className={classnames('density-space-name', styles.itemName, {
                [styles.campus]: space.space_type === CoreSpaceType.CAMPUS,
                [styles.disabled]: spaceDisabled,
                [styles.selected]: isSelected,
              })}
              {...{
                'data-density-space-type': space.space_type,
                'data-density-space-function': space.function,
              }}
            >
              {item.space.name}
            </span> : null}
            {isSelected ? <div className={styles.itemSelectedIndicator}></div> : null}
          </div>

          {spacesPage.showDoorways && spaceDoorways && !spacesPage.collapsedSpaces.has(item.space.id) && spaceDoorways.get(item.space.id)?.map(doorway => {
            const isSelected = value && value.type === 'DOORWAY' && value.doorway_id === doorway.id && value.space_id === item.space.id;
            return <div
              key={`${item.space.id}-${doorway.id}`}
              className={styles.item}
              style={{marginLeft: item.depth * 16, paddingLeft: 40}}
              onClick={e => navigateToItem({ type: 'DOORWAY', space_id: item.space.id, doorway_id: doorway.id })}
            >
              <span className={styles.itemIcon}>
                <Icons.Doorway width={18} height={18}
                  color={isSelected ? colors.blue : colors.gray700} />
              </span>
              <span className={classnames(styles.itemName, {
                [styles.selected]: isSelected,
              })}>
                {doorway.name}
              </span>
              {isSelected ? <div className={styles.itemSelectedIndicator}></div> : null}
            </div>;
          })}
        </Fragment>
      })}
      <div style={{height: 64}}></div>
    </AppScrollView>
  </div>
}
