import React, { Fragment, Component } from 'react';
import classnames from 'classnames';
import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter/index';
import colorVariables from '@density/ui/variables/colors.json';

import {
  InputBox,
  Switch,
  AppBar,
  AppBarTitle,
  AppBarSection,
  Icons,
} from '@density/ui';

import { getChildrenOfSpace, getParentsOfSpace } from '../../helpers/filter-hierarchy/index';
import fuzzy from 'fuzzy';

function deduplicate(array) {
  return [ ...(new Set(array) as any) ];
}

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

export default class AdminSpacePermissionsPicker extends Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      enabled: false,
      searchQuery: '',

      selectedSpaceIds: props.initialSelectedSpaceIds,
    };
  }

  render() {
    const { spaces } = this.props;
    const { enabled, searchQuery, selectedSpaceIds } = this.state;

    let hierarchy = spaceHierarchyFormatter(spaces.data, {renderZeroItems: false});
    if (searchQuery.length > 0) {
      hierarchy = searchHierarchy(hierarchy, spaces.data, searchQuery);
    }

    const hierarchySpaceIds = hierarchy.map(h => h.space.id);

    const selectAllInDeselectState = hierarchySpaceIds.length > 0 && hierarchySpaceIds.every(h => selectedSpaceIds.includes(h));

    return (
      <div className="admin-space-permissions-picker">
        <AppBar>
          <AppBarTitle>Space Permissions</AppBarTitle>
          <AppBarSection>
            <Switch
              onChange={e => this.setState({enabled: e.target.checked})}
              value={enabled}
            />
          </AppBarSection>
        </AppBar>
        <div className="admin-space-permissions-picker-body">
          <AppBar>
            {enabled ? (
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
                      className="admin-space-permissions-select-all-link"
                      onClick={() => {
                        if (selectAllInDeselectState) {
                          this.setState({
                            selectedSpaceIds: selectedSpaceIds.filter(s => !hierarchySpaceIds.includes(s))
                          });
                        } else {
                          this.setState({
                            selectedSpaceIds: deduplicate([...selectedSpaceIds, ...hierarchySpaceIds]),
                          });
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
          <ul className="admin-space-permissions-picker-scroll">
            {spaces.loading ? (
              <AdminSpacePermissionsPickerListItemLabelSkeleton />
            ) : (
              <Fragment>
                {hierarchy.map(item => (
                  <div
                    key={item.space.id}
                    className={`admin-space-permissions-picker-list-item depth-${item.depth}`}
                    style={{marginLeft: item.depth * 24}}
                  >
                    <input
                      type="checkbox"
                      disabled={!enabled}
                      className="admin-space-permissions-picker-list-item-checkbox"
                      checked={enabled ? selectedSpaceIds.includes(item.space.id) : true}
                      id={`admin-space-permissions-picker-space-${item.space.id}`}
                      onChange={e => {
                        if (e.target.checked) {
                          // When selecting a space:
                          // 1. Select the space itself
                          // 2. Select all parents of the space
                          // 2. Select all children of the space
                          this.setState(s => ({
                            selectedSpaceIds: deduplicate([
                              ...s.selectedSpaceIds,

                              item.space.id,
                              ...getParentsOfSpace(spaces.data, item.space),
                              ...getChildrenOfSpace(spaces.data, item.space),
                            ]),
                          }));
                        } else {
                          // When deselecting a space:
                          // 1. Deselect the space itself
                          // 2. Deselect all of its children
                          this.setState(s => ({
                            selectedSpaceIds: s.selectedSpaceIds.filter(n => {
                              return [
                                item.space.id,
                                ...getChildrenOfSpace(spaces.data, item.space),
                              ].indexOf(n) === -1;
                            }),
                          }));
                        }
                      }}
                    />
                    <label
                      className="admin-space-permissions-picker-list-item-label"
                      htmlFor={`admin-space-permissions-picker-space-${item.space.id}`}
                    >
                      {item.space.spaceType === 'building' ? (
                        <span className="admin-space-permissions-picker-list-item-icon">
                          <Icons.Building color={enabled ? colorVariables.grayCinder : colorVariables.grayDarker} />
                        </span>
                      ) : null}
                      {item.space.spaceType === 'floor' ? (
                        <span className="admin-space-permissions-picker-list-item-icon">
                          <Icons.Folder color={enabled ? colorVariables.grayCinder : colorVariables.grayDarker} />
                        </span>
                      ) : null}
                      <span className={classnames('admin-space-permissions-picker-list-item-name', {
                        'bold': ['campus', 'building', 'floor'].includes(item.space.spaceType),
                      })}>
                        {item.space.name}
                      </span>
                    </label>
                  </div>
                ))}
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
      <div className="admin-space-permissions-picker-list-item depth-0">
        <span className="admin-space-permissions-picker-list-item-label">
          <div className="admin-space-permissions-picker-list-item-label-skeleton" />
        </span>
      </div>
      <div className="admin-space-permissions-picker-list-item depth-0">
        <span className="admin-space-permissions-picker-list-item-label">
          <div className="admin-space-permissions-picker-list-item-label-skeleton" />
        </span>
      </div>
      <div
        className="admin-space-permissions-picker-list-item depth-1"
        style={{marginLeft: 24}}
      >
        <span className="admin-space-permissions-picker-list-item-label">
          <div className="admin-space-permissions-picker-list-item-label-skeleton" />
        </span>
      </div>
      <div
        className="admin-space-permissions-picker-list-item depth-2"
        style={{marginLeft: 48}}
      >
        <span className="admin-space-permissions-picker-list-item-label">
          <div className="admin-space-permissions-picker-list-item-label-skeleton" />
        </span>
      </div>
      <div
        className="admin-space-permissions-picker-list-item depth-2"
        style={{marginLeft: 48}}
      >
        <span className="admin-space-permissions-picker-list-item-label">
          <div className="admin-space-permissions-picker-list-item-label-skeleton" />
        </span>
      </div>
    </Fragment>
  );
}
