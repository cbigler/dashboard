import React, { Fragment, Component } from 'react';
import classnames from 'classnames';
import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter/index';

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

  calculateDisabledSpaceIds = () => {
    const { selectedSpaceIds } = this.state;
    const { spaces } = this.props;

    const parents = selectedSpaceIds.map(n => {
      return spaces.data.find(s => s.id === n)
        .ancestry
        .map(s => s.id);
    })

    return deduplicate([
      // All parents of selected spaces
      ...parents.flat(),
    ]);
  }

  render() {
    const { spaces } = this.props;
    const { enabled, searchQuery, selectedSpaceIds } = this.state;

    const disabledSpaceIds: any = []//this.calculateDisabledSpaceIds();

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
          {enabled ? (
            <ul className="admin-space-permissions-picker-scroll">
              {hierarchy.map(item => (
                <div
                  key={item.space.id}
                  className={`admin-space-permissions-picker-list-item depth-${item.depth}`}
                  style={{marginLeft: item.depth * 24}}
                >
                  <input
                    type="checkbox"
                    disabled={disabledSpaceIds.includes(item.space.id)}
                    checked={selectedSpaceIds.includes(item.space.id)}
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
                  <label htmlFor={`admin-space-permissions-picker-space-${item.space.id}`}>
                    {item.space.spaceType === 'building' ? (
                      <span className="admin-space-permissions-picker-list-item-icon">
                        <Icons.Building />
                      </span>
                    ) : null}
                    {item.space.spaceType === 'floor' ? (
                      <span className="admin-space-permissions-picker-list-item-icon">
                        <Icons.Folder />
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
            </ul>
          ) : null}
        </div>
      </div>
    );
  }
}
