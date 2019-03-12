import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import AdminSpacePermissionsPicker from '../admin-space-permissions-picker/index';
import AdminUserManagementRoleRadioList from '../admin-user-management-role-radio-list/index';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  AppBarContext,
  Icons,
  Button,
  InputBox,
} from '@density/ui';

import FormLabel from '../form-label';

export function AdminUserManagementDetail({spaces, user, users, selectedUser}) {
  switch (users.view) {
  case 'LOADING':
    return (
      <span>Loading state needs to be mocked out</span>
    );
  case 'ERROR':
    return (
      <span>Error state needs to be mocked out</span>
    );
  case 'VISIBLE':
    return (
      <div className="admin-user-management-detail">
        <AppBar>
          <AppBarTitle>
            <a
              role="button"
              className="admin-user-management-detail-main-arrow"
              href="#/admin/user-management"
            >
              <Icons.ArrowLeft />
            </a>
            <span className="admin-user-management-detail-main-title">Edit User</span>
          </AppBarTitle>
        </AppBar>

        <div className="admin-user-management-detail-columns">
          <div className="admin-user-management-detail-column left">
            <div className="admin-user-management-user-info">
              <h1 className="admin-user-management-user-info-name">
                {selectedUser.fullName || selectedUser.email}
              </h1>
              <span className="admin-user-management-user-info-email">{selectedUser.email}</span>
              <div>
                <span className="admin-user-management-user-info-role-tag">Owner</span>
              </div>
              <ul className="admin-user-management-user-info-details">
                {selectedUser.lastLogin ? (
                  <li>Last sign in: {moment.utc(selectedUser.lastLogin).fromNow()}</li>
                ) : (
                  <li>User has never signed in</li>
                )}
                <li>Created: NEED DATE HERE</li>
              </ul>
            </div>
          </div>
          <div className="admin-user-management-detail-column right">
            <div className="admin-user-management-detail-column-right-subcolumns">
              <div className="admin-user-management-detail-column-right-subcolumn left">
                <div className="admin-user-management-detail-card">
                  <AppBar>
                    <AppBarTitle>Info</AppBarTitle>
                  </AppBar>

                  <div className="admin-user-management-detail-card-body">
                    <FormLabel
                      label="Name"
                      htmlFor="admin-user-management-user-name"
                      input={<InputBox
                        type="text"
                        width="100%"
                        id="admin-user-management-user-name"
                        value={selectedUser.fullName}
                        onChange={console.log}
                      />}
                    />
                    <FormLabel
                      label="Email"
                      htmlFor="admin-user-management-user-email"
                      input={<InputBox
                        type="text"
                        width="100%"
                        id="admin-user-management-user-email"
                        value={selectedUser.email}
                        onChange={console.log}
                      />}
                    />
                  </div>
                </div>
                <div className="admin-user-management-detail-card half-height">
                  <AppBar>
                    <AppBarTitle>Roles</AppBarTitle>
                  </AppBar>
                  <div className="admin-user-management-detail-card-body">
                    <AdminUserManagementRoleRadioList
                      user={user}
                      value={selectedUser.role}
                      onChange={console.log}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-user-management-detail-column-right-subcolumn right">
                <div className="admin-user-management-detail-card">
                  <AdminSpacePermissionsPicker
                    spaces={spaces}
                    initialSelectedSpaceIds={[]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-user-management-detail-bottom-app-bar">
          <AppBarContext.Provider value="BOTTOM_ACTIONS">
            <AppBar>
              <AppBarSection>
                delete button goes here?
              </AppBarSection>
              <AppBarSection>
                <a
                  className="admin-user-management-detail-cancel-link"
                  role="button"
                  href="#/admin/user-management"
                >
                  Cancel
                </a>
                <Button type="primary">Save User</Button>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
        </div>
      </div>
    );
  default:
    return null;
  }
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    users: state.users,
    user: state.user,
    selectedUser: state.users.data.find(user => user.id === state.users.selected),
  };
}, dispatch => ({}))(AdminUserManagementDetail);
