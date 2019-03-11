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

import { getParentsOfSpace } from '../../helpers/filter-hierarchy/index';
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
                          selectedSpaceIds: [
                            ...(new Set([...selectedSpaceIds, ...hierarchySpaceIds]) as any)
                          ],
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
        <div className="admin-space-permissions-picker-body">
          <ul>
            {hierarchy.map(item => (
              <div
                key={item.space.id}
                className={`admin-space-permissions-picker-list-item depth-${item.depth}`}
                style={{marginLeft: item.depth * 24}}
              >
                <input
                  type="checkbox"
                  disabled={!enabled}
                  checked={enabled ? selectedSpaceIds.includes(item.space.id) : true}
                  id={`admin-space-permissions-picker-space-${item.space.id}`}
                  onChange={e => {
                    if (e.target.checked) {
                      this.setState(s => ({
                        selectedSpaceIds: [...s.selectedSpaceIds, item.space.id],
                      }));
                    } else {
                      this.setState(s => ({
                        selectedSpaceIds: s.selectedSpaceIds.filter(n => n !== item.space.id),
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
        </div>
      </div>
    );
  }
}
