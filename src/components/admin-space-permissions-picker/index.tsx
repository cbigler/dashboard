import React, { Fragment, Component } from 'react';
import classnames from 'classnames';
import spaceHierarchyFormatterNew from '../../helpers/space-hierarchy-formatter/index';
import colorVariables from '@density/ui/variables/colors.json';

import styles from './styles.module.scss';

import {
  InputBox,
  Switch,
  AppBar,
  AppBarTitle,
  AppBarSection,
  Icons,
  Skeleton,
} from '@density/ui';

import { getChildrenOfSpace, getParentsOfSpace, isParentSelected } from '../../helpers/filter-hierarchy/index';
import deduplicate from '../../helpers/deduplicate';
import fuzzy from 'fuzzy';

function searchHierarchy(hierarchy, spaces: Array<{id: string, name: string}>, searchQuery: string) {
  let ids: Array<string> = [];
  hierarchy.forEach(({space}) => {
    const parentIds = getParentsOfSpace(spaces, space);

    // It can either match the name of the space
    const result = fuzzy.match(searchQuery, space.name);
    if (result) {
      ids.push(space.id);
      ids = [...ids, ...parentIds];
      return;
    }

    // Or the name of a parent higher up in the hierarchy.
    const parentNames = parentIds.map(id => (spaces as any).find(s => s.id === id).name);
    const parentMatches = fuzzy.filter(searchQuery, parentNames);
    if (parentMatches.length > 0) {
      ids.push(space.id);
      ids = [...ids, ...parentIds];
      return;
    }
  });

  return hierarchy.filter(h => ids.includes(h.space.id));
}

type AdminSpacePermissionsPickerProps = {
  height?: number,
  disabled?: boolean,
  spaces: {
    loading: boolean,
    data: Array<any>,
  },
  spaceHierarchy: {
    loading: boolean,
    data: Array<any>,
  }

  active: boolean,
  onChangeActive: (boolean) => any,

  selectedSpaceIds: Array<string>,
  onChange: (any) => any,
};

export default class AdminSpacePermissionsPicker extends Component<AdminSpacePermissionsPickerProps, any> {
  state = { searchQuery: '', };

  render() {
    const {
      spaces,
      spaceHierarchy,
      selectedSpaceIds,
      onChange,
      active,
      onChangeActive,
      disabled = false,
      height = undefined,
    } = this.props;
    const { searchQuery } = this.state;

    let hierarchy = spaceHierarchyFormatterNew(spaceHierarchy.data);
    if (searchQuery.length > 0) {
      hierarchy = searchHierarchy(hierarchy, spaces.data, searchQuery);
    }

    const selectedIdsWithChildren = deduplicate(
      selectedSpaceIds.reduce((acc, next) => {
        const selectedSpace = spaces.data.find(x => x.id === next);
        return [...acc, ...getChildrenOfSpace(spaces.data, selectedSpace)];
      }, [] as string[])
    );
    const selectAllInDeselectState = spaces.data.length > 0 && spaces.data.every(s => {
      return selectedIdsWithChildren.indexOf(s.id) > -1;
    });

    return (
      <div className={styles.adminSpacePermissionsPicker} style={{height}}>
        <AppBar>
          <AppBarTitle>Space Permissions</AppBarTitle>
          <AppBarSection>
            <Switch
              value={active}
              disabled={disabled}
              onChange={e => onChangeActive(e.target.checked)}
            />
          </AppBarSection>
        </AppBar>
        <div className={styles.adminSpacePermissionsPickerBody}>
          <AppBar>
            {active ? (
              <Fragment>
                <AppBarSection>
                  <InputBox
                    leftIcon={<Icons.Search width={16} height={16} />}
                    placeholder={`ex. "Flex Office", "New York"`}
                    width={248}
                    value={searchQuery}
                    onChange={e => this.setState({searchQuery: e.target.value})}
                  />
                </AppBarSection>
                {hierarchy.length > 0 ? (
                  <AppBarSection>
                    <span
                      role="button"
                      className={styles.adminSpacePermissionsSelectAllLink}
                      onClick={() => {
                        if (selectAllInDeselectState) {
                          onChange([]);
                        } else {
                          onChange(deduplicate([...selectedSpaceIds, ...spaces.data.map(x => x.id)]));
                        }
                      }}
                    >
                      {selectAllInDeselectState ? 'Deselect All' : 'Select All'}
                    </span>
                  </AppBarSection>
                ) : null}
              </Fragment>
            ) : (
              <AppBarSection>
                Has access to&nbsp;<strong>All Spaces</strong>
              </AppBarSection>
            )}
          </AppBar>
          <ul 
            className={classnames(styles.adminSpacePermissionsPickerScroll, {
              [styles.noOverflow]: typeof height === 'undefined',
            })}
          >
            {(spaces.loading || spaceHierarchy.loading) ? (
              <AdminSpacePermissionsPickerListItemLabelSkeleton />
            ) : (
              <Fragment>
                {hierarchy.map(item => {
                  const outsidePurview = !spaces.data.find(x => x.id === item.space.id);
                  const parentSelected = isParentSelected(
                    spaces.data,
                    item.space.id,
                    selectedSpaceIds
                  );
                  return <div
                    key={item.space.id}
                    className={classnames(
                      styles.adminSpacePermissionsPickerListItem,
                      styles[`depth${item.depth}`]
                    )}
                    style={{marginLeft: item.depth * 24}}
                  >
                    <input
                      type="checkbox"
                      disabled={!active || parentSelected || outsidePurview}
                      checked={(!active && !outsidePurview) || parentSelected || selectedSpaceIds.includes(item.space.id)}
                      className={classnames(styles.adminSpacePermissionsPickerListItemCheckbox, {
                        [styles.active]: active
                      })}
                      id={`admin-space-permissions-picker-space-${item.space.id}`}
                      onChange={e => {
                        if (e.target.checked) {
                          // When selecting a space:
                          // 1. Select the space itself
                          // 2. Deselect all of its children
                          onChange(selectedSpaceIds.filter(n => {
                            return getChildrenOfSpace(spaces.data, item.space).indexOf(n) === -1;
                          }).concat([item.space.id]));
                        } else {
                          // When deselecting a space:
                          // 1. Deselect the space itself
                          // 2. Deselect all of its children
                          onChange(
                            selectedSpaceIds.filter(n => {
                              return n !== item.space.id && 
                                getChildrenOfSpace(spaces.data, item.space).indexOf(n) === -1;
                            })
                          );
                        }
                      }}
                    />
                    <label
                      className={styles.adminSpacePermissionsPickerListItemLabel}
                      htmlFor={`admin-space-permissions-picker-space-${item.space.id}`}
                    >
                      {item.space.spaceType === 'building' ? (
                        <span className={styles.adminSpacePermissionsPickerListItemIcon}>
                          <Icons.Building color={active ? colorVariables.grayCinder : colorVariables.grayDarker} />
                        </span>
                      ) : null}
                      {item.space.spaceType === 'floor' ? (
                        <span className={styles.adminSpacePermissionsPickerListItemIcon}>
                          <Icons.Folder color={active ? colorVariables.grayCinder : colorVariables.grayDarker} />
                        </span>
                      ) : null}
                      <span className={classnames(
                        styles.adminSpacePermissionsPickerListItemName, {
                        [styles.bold]: ['campus', 'building', 'floor'].includes(item.space.spaceType),
                      })}>
                        {item.space.name}
                      </span>
                    </label>
                  </div>;
                })}
              </Fragment>
            )}
          </ul>
        </div>
      </div>
    );
  }
}

function AdminSpacePermissionsPickerListItemLabelSkeleton() {
  return (
    <Fragment>
      <div className={classnames(styles.adminSpacePermissionsPickerListItem, styles.depth0)}>
        <span className={styles.adminSpacePermissionsPickerListItemLabel}>
          <div className={styles.adminSpacePermissionsPickerListItemLabelSkeleton}>
            <div style={{marginRight: 12, marginTop: 1}}>
              <Skeleton width={16} height={16} color={colorVariables.gray} />
            </div>
            <Skeleton width={150} height={6} color={colorVariables.grayDarker} />
          </div>
        </span>
      </div>
      <div className={classnames(styles.adminSpacePermissionsPickerListItem, styles.depth0)}>
        <span className={styles.adminSpacePermissionsPickerListItemLabel}>
          <div className={styles.adminSpacePermissionsPickerListItemLabelSkeleton}>
            <div style={{marginRight: 12, marginTop: 1}}>
              <Skeleton width={16} height={16} color={colorVariables.gray} />
            </div>
            <Skeleton width={150} height={6} color={colorVariables.grayDarker} />
          </div>
        </span>
      </div>
      <div
        className={classnames(styles.adminSpacePermissionsPickerListItem, styles.depth1)}
        style={{marginLeft: 24}}
      >
        <span className={styles.adminSpacePermissionsPickerListItemLabel}>
          <div className={styles.adminSpacePermissionsPickerListItemLabelSkeleton}>
            <div style={{marginRight: 12, marginTop: 1}}>
              <Skeleton width={16} height={16} color={colorVariables.gray} />
            </div>
            <Skeleton width={150} height={6} color={colorVariables.grayDarker} />
          </div>
        </span>
      </div>
      <div
        className={classnames(styles.adminSpacePermissionsPickerListItem, styles.depth2)}
        style={{marginLeft: 48}}
      >
        <span className={styles.adminSpacePermissionsPickerListItemLabel}>
          <div className={styles.adminSpacePermissionsPickerListItemLabelSkeleton}>
            <div style={{marginRight: 12, marginTop: 1}}>
              <Skeleton width={16} height={16} color={colorVariables.gray} />
            </div>
            <Skeleton width={150} height={6} color={colorVariables.grayDarker} />
          </div>
        </span>
      </div>
      <div
        className={classnames(styles.adminSpacePermissionsPickerListItem, styles.depth2)}
        style={{marginLeft: 48}}
      >
        <span className={styles.adminSpacePermissionsPickerListItemLabel}>
          <div className={styles.adminSpacePermissionsPickerListItemLabelSkeleton}>
            <div style={{marginRight: 12, marginTop: 1}}>
              <Skeleton width={16} height={16} color={colorVariables.gray} />
            </div>
            <Skeleton width={150} height={6} color={colorVariables.grayDarker} />
          </div>
        </span>
      </div>
    </Fragment>
  );
}
