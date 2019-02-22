import React, { Component, Fragment } from 'react';
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

import filterCollection from '../../helpers/filter-collection/index';
import convertSpacesToSpaceTree from '../../helpers/convert-spaces-to-space-tree/index';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';

const EXPLORE_BACKGROUND = '#F5F5F7';
const spaceFilter = filterCollection({fields: ['name']});

export function Admin({
  activePage,
  onSpaceSearch
}) {
  return (
    <Fragment>
      {/* Main application */}
      <AppFrame>
        <AppPane>
          <AppBar>
            <AppBarTitle>Administration</AppBarTitle>
            <div className="explore-appbar-subnav">
              <a href={`#/foo`}
                className={classnames('explore-subnav-link', activePage == "ADMIN_USER_MANAGEMENT" ? 'selected' : '')}>User Management</a>
              <a href={`#/bar`}
                className={classnames('explore-subnav-link', activePage == "ADMIN_DEVELOPER" ? 'selected' : '')}>Developer</a>
              <a href={`#/baz`}
                className={classnames('explore-subnav-link', activePage == "ADMIN_DEVICE_STATUS" ? 'selected' : '')}>Device Status</a>
            </div>
          </AppBar>
          <AppScrollView>
            <div style={{height:1000}}>ASDFASDF</div>
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
})(Admin);
