import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import InputBox from '@density/ui-input-box';
import AppBar from '@density/ui-app-bar';
import AppFrame from '@density/ui-app-frame';
import AppPane from '@density/ui-app-pane';
import AppSidebar from '@density/ui-app-sidebar';
import AppScrollView from '@density/ui-app-scroll-view';
import AppBarTransparent from '../app-bar-transparent/index';
import Card, { CardBody, CardLoading, CardWell, CardWellHighlight } from '@density/ui-card';
import { IconBuilding, IconFolder, IconL, IconChevronRight, IconChevronDown } from '@density/ui-icons';

import filterCollection from '../../helpers/filter-collection/index';
import convertSpacesToSpaceTree from '../../helpers/convert-spaces-to-space-tree/index';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';
import ExploreSpaceTrends from '../explore-space-trends/index';
import ExploreSpaceDaily from '../explore-space-daily/index';
import ExploreSpaceDataExport from '../explore-space-data-export/index';

const EXPLORE_BACKGROUND = '#F5F5F7';
const spaceFilter = filterCollection({fields: ['name']});


function ExploreSidebarItem({selected, id, name, spaceType, depth, activePage}) {
  let page;
  switch(activePage) {
    case 'EXPLORE_SPACE_TRENDS':
      page = "trends";
      break;
    case 'EXPLORE_SPACE_DAILY':
      page = "daily";
      break;
    case 'EXPLORE_SPACE_DATA_EXPORT':
      page = "data-export";
      break;
    default:
      page = "trends";
      break;
  }

  const isSpace = (spaceType == "space")

  let icon;
  switch(spaceType) {
    case 'campus':
      icon = "";
      break;
    case 'building':
      icon = <IconBuilding />;
      break;
    case 'floor':
      icon = <IconFolder />;
      break;
    case 'space':
      icon = <IconL />;
      break;
    default:
      icon = "";
      break;
  }

  if (isSpace) {
    return (
      <a className={classnames("explore-app-frame-sidebar-list-item", spaceType)} href={`#/spaces/explore/${id}/${page}`}>
        <div className={classnames('explore-sidebar-item', {selected})}>
          <div className='explore-sidebar-item-row'>
            {icon}
            <span className="explore-sidebar-item-name">{name}</span>
          </div>
        </div>
      </a>
    );
  } else {
    return (
      <div className={classnames("explore-app-frame-sidebar-list-item", spaceType)}>
        <div className={classnames('explore-sidebar-item', {selected})}>
          <div className='explore-sidebar-item-row'>
            {icon}
            <span className="explore-sidebar-item-name">{name}</span>
          </div>
        </div>
      </div>
    );
  }
}

function RenderExploreSidebarItem(space, activePage, selectedSpace, depth) {
  return (
    <div key={space.id} className={`${space.spaceType}-container`}>
      <ExploreSidebarItem
        id={space.id}
        name={space.name}
        spaceType={space.spaceType}
        depth={depth}
        activePage={activePage}
        selected={selectedSpace ? selectedSpace.id === space.id : false}
      />
      {space.children && space.children.map(space => (
        RenderExploreSidebarItem(space, activePage, selectedSpace, depth+1)
      ))}
    </div>
  )
}

function ExploreSpacePage({ activePage }) {
  switch(activePage) {
    case 'EXPLORE_SPACE_TRENDS':
      return <ExploreSpaceTrends />;
    case 'EXPLORE_SPACE_DAILY':
      return <ExploreSpaceDaily />;
    case 'EXPLORE_SPACE_DATA_EXPORT':
      return <ExploreSpaceDataExport />;
    default:
      return null;
  }
}

export function Explore({
  spaces,
  selectedSpace,
  activePage,
  onSpaceSearch
}) {
  let filteredSpaces = spaces.data;
  if (spaces.filters.search) {
    filteredSpaces = spaceFilter(filteredSpaces, spaces.filters.search);
  }
  const spacesByName = filteredSpaces.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });
  const spaceTree = convertSpacesToSpaceTree(filteredSpaces)
  const spaceList = spaces.filters.search ? spacesByName : spaceTree;

  return (
    <Fragment>
      {/* Main application */}
      <AppFrame>
        <AppSidebar visible={true}>
          <AppBar leftSpan={(
            <InputBox
              type="text"
              width="100%"
              placeholder="Filter Spaces ..."
              disabled={false}
              value={spaces.filters.search}
              onChange={e => onSpaceSearch(e.target.value)}
            />
          )} />
          <AppScrollView>
            <nav className="explore-app-frame-sidebar-list">
                <Fragment>
                  {spaceList.length == 0 ? <div className="loading-spaces">Loading Spaces...</div> : null}
                  {spaceList.map(space => (
                    RenderExploreSidebarItem(space, activePage, selectedSpace, 0)
                  ))}
                </Fragment>
            </nav>
          </AppScrollView>
        </AppSidebar>
        <AppPane>
          <div className="explore-appbar">
            <div className="explore-appbar-title">{selectedSpace ? selectedSpace.name : ""}</div>
            { selectedSpace ?
            <div className="explore-appbar-subnav">
              <a href={`#/spaces/explore/${spaces.selected}/trends`}
                className={classnames('explore-subnav-link', activePage == "EXPLORE_SPACE_TRENDS" ? 'selected' : '')}>Trends</a>
              <a href={`#/spaces/explore/${spaces.selected}/daily`}
                className={classnames('explore-subnav-link', activePage == "EXPLORE_SPACE_DAILY" ? 'selected' : '')}>Daily</a>
              <a href={`#/spaces/explore/${spaces.selected}/data-export`}
                className={classnames('explore-subnav-link', activePage == "EXPLORE_SPACE_DATA_EXPORT" ? 'selected' : '')}>Data Export</a>
            </div> : null}
          </div>
          <AppScrollView backgroundColor={EXPLORE_BACKGROUND}>
            <ExploreSpacePage activePage={activePage} />
          </AppScrollView>
        </AppPane>
      </AppFrame>
    </Fragment>
  );
}

export default connect((state: any) => {
  const selectedSpace = state.spaces.data.find(d => d.id === state.spaces.selected);
  return {
    spaces: state.spaces,
    selectedSpace
  };
}, dispatch => {
  return {
    onSpaceSearch(searchQuery) {
      dispatch(collectionSpacesFilter('search', searchQuery));
    },
  };
})(Explore);
