import styles from './styles.module.scss';

import React, { Fragment } from 'react';
import moment from 'moment-timezone';
import classnames from 'classnames';

import AdminSpacePermissionsPicker from '../admin-space-permissions-picker/index';
import AdminUserManagementRoleRadioList from '../admin-user-management-role-radio-list/index';
import GenericErrorState from '../generic-error-state/index';
import GenericLoadingState from '../generic-loading-state/index';

import { ROLE_INFO } from '../../helpers/permissions';

import showModal from '../../rx-actions/modal/show';
import { showToast } from '../../rx-actions/toasts';
import collectionUsersDelete from '../../rx-actions/users/delete';
import collectionUsersUpdate from '../../rx-actions/users/update';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  Button,
  ButtonGroup,
  Icons,
} from '@density/ui/src';

import useRxStore from '../../helpers/use-rx-store';
import usersStore from '../../rx-stores/users';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import { UserActionTypes } from '../../types/users';
import UserStore from '../../rx-stores/user';
import SpacesLegacyStore from '../../rx-stores/spaces-legacy';
import SpaceHierarchyStore from '../../rx-stores/space-hierarchy';
import { DispatchType } from '../../types/rx-actions';
import { CoreUser } from '@density/lib-api-types/core-v2/users';

function onStartDeleteUser(dispatch: DispatchType, user: CoreUser) {
  showModal(dispatch, 'MODAL_CONFIRM', {
    prompt: 'Are you sure you want to delete this user?',
    confirmText: 'Delete',
    callback: () => {
      collectionUsersDelete(dispatch, user).then(ok => {
        if (ok) {
          window.location.href = '#/admin/user-management';
        }
      });
    },
  });
}

async function onSaveUser(dispatch: DispatchType, {
  id,
  role,
  space_ids,
  spaceFilteringActive
}: {
  id: string,
  role?: string,
  space_ids?: string[],
  spaceFilteringActive?: boolean,
}) {
  const ok = await collectionUsersUpdate(dispatch, {
    id,
    role,
    spaces: spaceFilteringActive ? space_ids : [],
  });
  if (ok) {
    showToast(dispatch, { text: 'User updated successfully!' });
    window.location.href = '#/admin/user-management';
  } else {
    showToast(dispatch, { type: 'error', text: 'Error updating user' });
  }
}

export default function AdminUserManagementDetail() {

  const user = useRxStore(UserStore);
  const spaceHierarchy = useRxStore(SpaceHierarchyStore);

  // Connect to the RxJS store and dispatch
  const users = useRxStore(usersStore);
  const spaces = useRxStore(SpacesLegacyStore);
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
      const formValid = !users.editor.spaceFilteringActive || (users.editor.space_ids || []).length > 0;

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
                        space_ids: users.editor.space_ids,
                        spaceFilteringActive: users.editor.spaceFilteringActive,
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
                      
                      {selectedUser.full_name ? (
                        <div className={styles.adminUserManagementUserInfoAvatar}>
                          {
                            (selectedUser.full_name || '')
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
                          {selectedUser.full_name || '---'}
                        </h1>
                        <div className={styles.adminUserManagementUserInfoEmail}>{selectedUser.email}</div>
                      </div>

                      <div className={styles.adminUserManagementUserInfoRoleTag}>
                        {ROLE_INFO[selectedUser.role].label}
                      </div>

                      <dl className={styles.adminUserManagementUserInfoDetails}>
                        {selectedUser.last_login ? (
                          <dd className={styles.adminUserManagementUserInfoDetailsItem}>Last sign in {moment.utc(selectedUser.last_login).fromNow()}</dd>
                        ) : (
                          <dd className={styles.adminUserManagementUserInfoDetailsItem}>Hasn't signed in</dd>
                        )}
                        <dd className={styles.adminUserManagementUserInfoDetailsItem}>
                          Created on{' '}
                          {selectedUser.created_at ? moment.utc(selectedUser.created_at).local().format('MMM DD, YYYY') : '(unknown)'}
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
                          space_ids: role === 'owner' ? [] : users.editor.space_ids || []
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
                    selectedSpaceIds={users.editor.space_ids || []}
                    onChange={space_ids => dispatch({
                      type: UserActionTypes.USER_MANAGEMENT_UPDATE_EDITOR,
                      state: { space_ids }
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
