import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import {
  AppBar,
  AppBarTitle,
  AppFrame,
  AppPane,
  AppScrollView,
} from '@density/ui';

import AppBarSubnav, { AppBarSubnavLink } from '../app-bar-subnav';
import AdminUserManagement from '../admin-user-management';

export function Admin({
  activePage
}) {
  return (
    <Fragment>
      {/* Main application */}
      <AppFrame>
        <AppPane>
          <AppBar>
            <AppBarTitle>Administration</AppBarTitle>
            <AppBarSubnav>
              <AppBarSubnavLink
                href="#/admin/user-management"
                active={activePage === "ADMIN_USER_MANAGEMENT"}
              >
                User Management
              </AppBarSubnavLink>
              <AppBarSubnavLink
                href="#/admin/developer"
                active={activePage === "ADMIN_DEVELOPER"}
              >
                Developer
              </AppBarSubnavLink>
              <AppBarSubnavLink
                href="#/admin/device-status"
                active={activePage === "ADMIN_DEVICE_STATUS"}
              >
                Device Status
              </AppBarSubnavLink>
            </AppBarSubnav>
          </AppBar>
          <AppScrollView>
            {activePage === 'ADMIN_USER_MANAGEMENT' ? <AdminUserManagement /> : null}
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
      //dispatch(collectionSpacesFilter('search', searchQuery));
    },
  };
})(Admin);
