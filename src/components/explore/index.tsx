import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import {
  AppBar,
  AppBarTitle,
  AppFrame,
  AppPane,
  AppSidebar,
  AppScrollView,
  Icons,
  InputBox,
} from '@density/ui';

import AppBarSubnav, { AppBarSubnavLink } from '../app-bar-subnav';

import filterCollection from '../../helpers/filter-collection/index';
import convertSpacesToSpaceTree from '../../helpers/convert-spaces-to-space-tree/index';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';
import ExploreSpaceTrends from '../explore-space-trends/index';
import ExploreSpaceDaily from '../explore-space-daily/index';
import ExploreSpaceDataExport from '../explore-space-data-export/index';

const EXPLORE_BACKGROUND = '#F5F5F7';
const spaceFilter = filterCollection({fields: ['name']});


function ExploreSidebarItem({selected, id, name, spaceType, activePage}) {
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
      icon = <Icons.Building />;
      break;
    case 'floor':
      icon = <Icons.Folder />;
      break;
    case 'space':
      icon = <Icons.L />;
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
  let spacesByName = filteredSpaces.sort(function(a, b) {
    return a.name.localeCompare(b.name);
  });
  // only show "spaces" in search results
  spacesByName.filter(space => space.spaceType == "space");

  const spaceTree = convertSpacesToSpaceTree(filteredSpaces)
  const spaceList = spaces.filters.search ? spacesByName : spaceTree;

  return (
    <Fragment>
      {/* Main application */}
      <AppFrame>
        <AppSidebar visible={true}>
          <AppBar>
            <InputBox
              type="text"
              width="100%"
              placeholder="Filter Spaces ..."
              disabled={false}
              value={spaces.filters.search}
              onChange={e => onSpaceSearch(e.target.value)}
            />
          </AppBar>
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
          <AppBar>
            <AppBarTitle>{selectedSpace ? selectedSpace.name : ""}</AppBarTitle>
            { selectedSpace ?
            <AppBarSubnav>
              <AppBarSubnavLink
                href={`#/spaces/explore/${spaces.selected}/trends`}
                active={activePage === "EXPLORE_SPACE_TRENDS"}
              >
                Trends
              </AppBarSubnavLink>
              <AppBarSubnavLink
                href={`#/spaces/explore/${spaces.selected}/daily`}
                active={activePage === "EXPLORE_SPACE_DAILY"}
              >
                Daily
              </AppBarSubnavLink>
              <AppBarSubnavLink
                href={`#/spaces/explore/${spaces.selected}/data-export`}
                active={activePage === "EXPLORE_SPACE_DATA_EXPORT"}
              >
                Data Export
              </AppBarSubnavLink>
            </AppBarSubnav> : null}
          </AppBar>
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
