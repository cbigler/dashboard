import styles from './styles.module.scss';

import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import classnames from 'classnames';

import AdminSpacePermissionsPicker from '../admin-space-permissions-picker/index';
import AdminUserManagementRoleRadioList from '../admin-user-management-role-radio-list/index';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';

import { ROLE_INFO } from '../../helpers/permissions';

import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';
import collectionUsersDelete from '../../rx-actions/users/delete';
import collectionUsersUpdate from '../../rx-actions/users/update';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  Button,
  ButtonGroup,
  Icons,
} from '@density/ui';

import useRxStore from '../../helpers/use-rx-store';
import usersStore from '../../rx-stores/users';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import { UserActionTypes } from '../../interfaces/users';

function onStartDeleteUser(dispatch, user) {
  dispatch(showModal('MODAL_CONFIRM', {
    prompt: 'Are you sure you want to delete this user?',
    confirmText: 'Delete',
    callback: () => {
      collectionUsersDelete(dispatch, user).then(ok => {
        if (ok) {
          window.location.href = '#/admin/user-management';
        }
      });
    },
  }));
}

async function onSaveUser(dispatch, {id, role, spaceIds, spaceFilteringActive}) {
  const ok = await collectionUsersUpdate(dispatch, {
    id,
    role,
    spaces: spaceFilteringActive ? spaceIds : [],
  });
  if (ok) {
    dispatch(showToast({ text: 'User updated successfully!' }));
    window.location.href = '#/admin/user-management';
  } else {
    dispatch(showToast({ type: 'error', text: 'Error updating user' }));
  }
}

export default function AdminUserManagementDetail() {

  // DEPRECATED: Pull some state from the Redux store
  const { spaces, spaceHierarchy, user } = useSelector((state: any) => ({
    spaces: state.spaces,
    spaceHierarchy: state.spaceHierarchy,
    user: state.user,
  }));

  // Connect to the RxJS store and dispatch
  const users = useRxStore(usersStore);
  const dispatch = useRxDispatch();

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
      if (!users.editor.data) { return null; }
      const selectedUser = users.editor.data || {};
      const formValid = !users.editor.spaceFilteringActive || (users.editor.spaceIds || []).length > 0;

      return (
        <Fragment>
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
                <ButtonGroup>
                  <Button variant="underline" onClick={() => window.location.hash = '#/admin/user-management'}>Cancel</Button>
                  <Button
                    variant="filled"
                    type="primary"
                    disabled={!formValid}
                    onClick={() => {
                      
                      onSaveUser(dispatch, {
                        id: selectedUser.id,
                        role: users.editor.role,

                        spaceFilteringActive: users.editor.spaceFilteringActive,
                        spaceIds: users.editor.spaceIds,
                      });
                    }}
                  >Save user</Button>
                </ButtonGroup>
              </AppBarSection>
            </AppBar>
          </div>

          <div className={styles.adminUserManagementDetail}>
            <div className={styles.adminUserManagementDetailWrapper}>

              <div className={styles.adminUserManagementDetailSection}>
                <div className={styles.adminUserManagementDetailCard}>
                  <div className={styles.adminUserManagementDetailCardBody}>
                    <div className={styles.adminUserManagementUserInfo}>
                      
                      {selectedUser.fullName ? (
                        <div className={styles.adminUserManagementUserInfoAvatar}>
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

                      <div className={styles.adminUserManagementUserInfoTitle}>
                        <h1 className={styles.adminUserManagementUserInfoName}>
                          {selectedUser.fullName || '---'}
                        </h1>
                        <div className={styles.adminUserManagementUserInfoEmail}>{selectedUser.email}</div>
                      </div>

                      <div className={styles.adminUserManagementUserInfoRoleTag}>
                        {ROLE_INFO[selectedUser.role].label}
                      </div>

                      <dl className={styles.adminUserManagementUserInfoDetails}>
                        {selectedUser.lastLogin ? (
                          <dd className={styles.adminUserManagementUserInfoDetailsItem}>Last sign in {moment.utc(selectedUser.lastLogin).fromNow()}</dd>
                        ) : (
                          <dd className={styles.adminUserManagementUserInfoDetailsItem}>Hasn't signed in</dd>
                        )}
                        <dd className={styles.adminUserManagementUserInfoDetailsItem}>
                          Created on{' '}
                          {selectedUser.createdAt ? moment.utc(selectedUser.createdAt).local().format('MMM DD, YYYY') : '(unknown)'}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.adminUserManagementDetailSection}>
                <div className={styles.adminUserManagementDetailCard}>
                  <AppBar>
                    <AppBarTitle>Roles</AppBarTitle>
                  </AppBar>
                  <div className={styles.adminUserManagementDetailCardBody}>
                    <AdminUserManagementRoleRadioList
                      user={user}
                      value={users.editor.role}
                      onChange={role => dispatch({
                        type: UserActionTypes.USER_MANAGEMENT_UPDATE_EDITOR,
                        state: {
                          role,
                          spaceFilteringActive: role === 'owner' ? false : users.editor.spaceFilteringActive,
                          spaceIds: role === 'owner' ? [] : users.editor.spaceIds || []
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.adminUserManagementDetailSection}>
                <div className={styles.adminUserManagementDetailCard}>
                  <AdminSpacePermissionsPicker
                    spaces={spaces}
                    spaceHierarchy={spaceHierarchy}
                    disabled={users.editor.role === 'owner'}
                    active={users.editor.spaceFilteringActive || false}
                    onChangeActive={spaceFilteringActive => dispatch({
                      type: UserActionTypes.USER_MANAGEMENT_UPDATE_EDITOR,
                      state: { spaceFilteringActive }
                    })}
                    selectedSpaceIds={users.editor.spaceIds || []}
                    onChange={spaceIds => dispatch({
                      type: UserActionTypes.USER_MANAGEMENT_UPDATE_EDITOR,
                      state: { spaceIds }
                    })}
                    height={600}
                  />
                </div>
              </div>

              <div className={styles.adminUserManagementDetailSection}>
                <div className={classnames(styles.adminUserManagementDetailCard, styles.adminUserManagementDetailCardDanger)}>
                  <AppBar>
                    <AppBarTitle>Danger Zone</AppBarTitle>
                  </AppBar>
                  <div className={styles.adminUserManagementDetailCardBody}>
                    <div className={styles.adminUserManagementDetailActionDetail}>
                      <div className={styles.adminUserManagementDetailActionDetailInfo}>
                        <h4 className={styles.adminUserManagementDetailActionDetailHeader}>Delete this user</h4>
                        <p className={styles.adminUserManagementDetailActionDetailLead}>Once deleted, they will be gone forever. Please be certain.</p>
                      </div>
                      <Button variant="underline" type="danger" onClick={() => onStartDeleteUser(dispatch, selectedUser)}>
                        Delete this user
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Fragment>
      );
    default:
      return null;
    }
}
