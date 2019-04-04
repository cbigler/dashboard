import styles from './styles.module.scss';

import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import AdminSpacePermissionsPicker from '../admin-space-permissions-picker/index';
import AdminUserManagementRoleRadioList from '../admin-user-management-role-radio-list/index';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';

import { ROLE_INFO } from '../../helpers/permissions';

import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';
import collectionUsersDestroy from '../../actions/collection/users/destroy';
import collectionUsersUpdate from '../../actions/collection/users/update';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  AppBarContext,
  Icons,
  Button,
  ButtonContext,
} from '@density/ui';

import Dialogger from '../dialogger';

import { DensitySpace, DensityUser } from '../../types';

type AdminUserManagementDetailProps = {
  spaces: {
    loading: boolean,
    data: Array<DensitySpace>,
  },
  spaceHierarchy: {
    loading: boolean,
    data: Array<any>,
  },
  users: {
    view: 'LOADING' | 'ERROR' | 'VISIBLE',
    data: Array<DensityUser>,
    error: string,
  },
  user: {
    data: DensityUser,
    loading: boolean,
    error: boolean,
  },
  selectedUser: DensityUser,

  onStartDeleteUser: (DensityUser) => any,
  onSaveUser: (DensityUser) => any,
};

type AdminUserManagementDetailState = {
  waitingForData: boolean,
  role?: string,

  spaceFilteringActive?: boolean,
  spaceIds?: string[],
};

export class AdminUserManagementDetail extends Component<AdminUserManagementDetailProps, AdminUserManagementDetailState> {
  state = {
    waitingForData: true,
    role: '',

    spaceFilteringActive: false,
    spaceIds: [] as string[],
  };

  setInitialState = (selectedUser) => {
    if (this.state.waitingForData && selectedUser) {
      this.setState({
        waitingForData: false,
        role: selectedUser.role,

        spaceFilteringActive: (selectedUser.spaces || []).length > 0,
        spaceIds: selectedUser.spaces || [],
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
      spaceHierarchy,
      user,
      users,
      selectedUser,

      onStartDeleteUser,
      onSaveUser,
    } = this.props;

    switch (users.view) {
    case 'LOADING':
      return (
        <div className={styles.adminUserManagementDetailLoading}>
          <GenericLoadingState />
        </div>
      );
    case 'ERROR':
      return (
        <div className={styles.adminUserManagementDetailError}>
          <GenericErrorState />
        </div>
      );
    case 'VISIBLE':
      if (!selectedUser) { return null; }

      const formValid = !this.state.spaceFilteringActive || this.state.spaceIds.length > 0;

      return (
        <Fragment>
          {/* Display user delete confirmation dialog */}
          <Dialogger />

          <div className={styles.adminUserManagementDetailAppBar}>
            <AppBar>
              <AppBarTitle>
                <a
                  role="button"
                  className={styles.adminUserManagementDetailMainArrow}
                  href="#/admin/user-management"
                >
                  <Icons.ArrowLeft />
                </a>
                <span className={styles.adminUserManagementDetailMainTitle}>Edit User</span>
              </AppBarTitle>
              <AppBarSection>
                <ButtonContext.Provider value="CANCEL_BUTTON">
                  <Button onClick={() => window.location.hash = '#/admin/user-management'}>Cancel</Button>
                </ButtonContext.Provider>
                <Button
                  type="primary"
                  disabled={!formValid}
                  onClick={() => {
                    onSaveUser({
                      id: selectedUser.id,
                      role: this.state.role,

                      spaceFilteringActive: this.state.spaceFilteringActive,
                      spaceIds: this.state.spaceIds,
                    });
                  }}
                >Save User</Button>
              </AppBarSection>
            </AppBar>
          </div>

          <div className={styles.adminUserManagementDetail}>
            <div className={styles.adminUserManagementDetailWrapper}>
              <div className={styles.adminUserManagementDetailColumns}>
                <div className={`${styles.adminUserManagementDetailColumn} ${styles.left}`}>
                  <div className={styles.adminUserManagementUserInfo}>
                    {selectedUser.fullName ? (
                      <div className={styles.adminUserManagementUserInfoIcon}>
                        {
                          (selectedUser.fullName || '')
                          .split(' ')
                          .slice(0, 2)
                          .filter(word => word.length > 0)
                          .map(word => word[0].toUpperCase())
                          .join('')
                        }
                      </div>
                    ) : null}
                    <h1 className={styles.adminUserManagementUserInfoName}>
                      {selectedUser.fullName || '---'}
                    </h1>
                    <span className={styles.adminUserManagementUserInfoEmail}>{selectedUser.email}</span>
                    <div>
                      <span className={styles.adminUserManagementUserInfoRoleTag}>
                        {ROLE_INFO[selectedUser.role].label}
                      </span>
                    </div>
                    <ul className={styles.adminUserManagementUserInfoDetails}>
                      {selectedUser.lastLogin ? (
                        <li>Last sign in: {moment.utc(selectedUser.lastLogin).fromNow()}</li>
                      ) : (
                        <li>User has never signed in</li>
                      )}
                      <li>
                        Created:{' '}
                        {selectedUser.createdAt ? moment.utc(selectedUser.createdAt).local().format('MMM DD, YYYY') : '(unknown)'}
                      </li>
                    </ul>
                  </div>
                </div>
                <div className={`${styles.adminUserManagementDetailColumn} ${styles.right}`}>
                  <div className={styles.adminUserManagementDetailColumnRightSubcolumns}>
                    <div className={`${styles.adminUserManagementDetailColumnRightSubcolumn} ${styles.left}`}>
                      <div className={styles.adminUserManagementDetailCard}>
                        <AppBar>
                          <AppBarTitle>Roles</AppBarTitle>
                        </AppBar>
                        <div className={styles.adminUserManagementDetailCardBody}>
                          <AdminUserManagementRoleRadioList
                            user={user}
                            value={this.state.role}
                            onChange={role => this.setState({
                              role,
                              spaceFilteringActive: role === 'owner' ? false : this.state.spaceFilteringActive,
                              spaceIds: role === 'owner' ? [] : this.state.spaceIds,
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={`${styles.adminUserManagementDetailColumnRightSubcolumn} ${styles.right}`}>
                      <div className={styles.adminUserManagementDetailCard}>
                        <AdminSpacePermissionsPicker
                          spaces={spaces}
                          spaceHierarchy={spaceHierarchy}
                          disabled={this.state.role === 'owner'}
                          active={this.state.spaceFilteringActive}
                          onChangeActive={spaceFilteringActive => this.setState({spaceFilteringActive})}
                          selectedSpaceIds={this.state.spaceIds}
                          onChange={spaceIds => this.setState({spaceIds})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <AppBarContext.Provider value="BOTTOM_ACTIONS">
                <AppBar>
                  <AppBarSection>
                    <ButtonContext.Provider value="USER_MANAGEMENT_DETAIL_DELETE_BUTTON">
                      <Button onClick={() => onStartDeleteUser(selectedUser)}>
                        Delete this User
                      </Button>
                    </ButtonContext.Provider>
                  </AppBarSection>
                </AppBar>
              </AppBarContext.Provider>
            </div>
          </div>
        </Fragment>
      );
    default:
      return null;
    }
  }
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    spaceHierarchy: state.spaceHierarchy,
    users: state.users,
    user: state.user,
    selectedUser: state.users.data.find(user => user.id === state.users.selected),
  };
}, dispatch => ({
  onStartDeleteUser(user) {
    dispatch<any>(showModal('MODAL_CONFIRM', {
      prompt: 'Are you sure you want to delete this user?',
      confirmText: 'Delete',
      callback: () => {
        dispatch<any>(collectionUsersDestroy(user)).then(ok => {
          if (ok) {
            window.location.href = '#/admin/user-management';
          }
        });
      },
    }));
  },
  async onSaveUser({id, role, spaceIds, spaceFilteringActive}) {
    const ok = await dispatch<any>(collectionUsersUpdate({
      id,
      role,
      spaces: spaceFilteringActive ? spaceIds : [],
    }));
    if (ok) {
      dispatch<any>(showToast({ text: 'User updated successfully!' }));
      window.location.href = '#/admin/user-management';
    } else {
      dispatch<any>(showToast({ type: 'error', text: 'Error updating user' }));
    }
  },
}))(AdminUserManagementDetail);