import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import AdminSpacePermissionsPicker from '../admin-space-permissions-picker/index';
import AdminUserManagementRoleRadioList from '../admin-user-management-role-radio-list/index';

import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';
import collectionUsersDestroy from '../../actions/collection/users/destroy';
import collectionUsersPush from '../../actions/collection/users/push';
import collectionUsersUpdate from '../../actions/collection/users/update';

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
import Dialogger from '../dialogger';

type AdminUserManagementDetailProps = {
  spaces: {
    data: Array<any>,
  },
  users: {
    view: 'LOADING' | 'ERROR' | 'VISIBLE',
    data: Array<any>,
    error: string,
  },
  user: any,
  selectedUser: any,

  onStartDeleteUser: (any) => any,
  onSaveUser: (any) => any,
};

type AdminUserManagementDetailState = {
  waitingForData: boolean,
  fullName?: string,
  email?: string,
  role?: string,
};

export class AdminUserManagementDetail extends Component<AdminUserManagementDetailProps, AdminUserManagementDetailState> {
  state = {
    waitingForData: true,
    fullName: '',
    email: '',
    role: '',
  };

  setInitialState = (selectedUser) => {
    if (this.state.waitingForData && selectedUser) {
      this.setState({
        waitingForData: false,
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        role: selectedUser.role,
      });
    }
  }

  componentDidMount() {
    this.setInitialState(this.props.selectedUser);
  }
  componentWillReceiveProps({selectedUser}) {
    this.setInitialState(selectedUser);
  }

  render() {
    const {
      spaces,
      user,
      users,
      selectedUser,

      onStartDeleteUser,
      onSaveUser,
    } = this.props;

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
          {/* Display user delete confirmation dialog */}
          <Dialogger />

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
                          value={this.state.fullName}
                          onChange={e => this.setState({fullName: e.target.value})}
                        />}
                      />
                      <FormLabel
                        label="Email"
                        htmlFor="admin-user-management-user-email"
                        input={<InputBox
                          type="text"
                          width="100%"
                          id="admin-user-management-user-email"
                          value={this.state.email}
                          onChange={e => this.setState({email: e.target.value})}
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
                        value={this.state.role}
                        onChange={role => this.setState({role})}
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
                  <Button onClick={() => onStartDeleteUser(selectedUser)}>
                    delete button goes here?
                  </Button>
                </AppBarSection>
                <AppBarSection>
                  <a
                    className="admin-user-management-detail-cancel-link"
                    role="button"
                    href="#/admin/user-management"
                  >
                    Cancel
                  </a>
                  <Button
                    type="primary"
                    onClick={() => {
                      onSaveUser({
                        id: selectedUser.id,
                        fullName: this.state.fullName,
                        email: this.state.email !== selectedUser.email ? this.state.email : undefined,
                        role: this.state.role,
                      });
                    }}
                  >Save User</Button>
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
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    users: state.users,
    user: state.user,
    selectedUser: state.users.data.find(user => user.id === state.users.selected),
  };
}, dispatch => ({
	onStartDeleteUser(user) {
		dispatch<any>(showModal('MODAL_CONFIRM', {
			prompt: 'Are you sure you want to delete this user?',
			confirmText: 'Delete',
			callback: () => dispatch<any>(collectionUsersDestroy(user)),
		}));
	},
  async onSaveUser({id, fullName, email, role}) {
    const ok = await dispatch<any>(collectionUsersUpdate({ id, fullName, email, role }));
    if (ok) {
      dispatch<any>(showToast({ text: 'User role updated successfully' }));
      window.location.href = '#/admin/user-management';
    } else {
      dispatch<any>(showToast({ type: 'danger', text: 'Error updating user role' }));
    }
  },
}))(AdminUserManagementDetail);
