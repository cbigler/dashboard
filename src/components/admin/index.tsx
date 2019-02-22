import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import {
  AppBar,
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
          <AppBar title="Administration" rightSpan={<span>ASDF</span>} />
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
