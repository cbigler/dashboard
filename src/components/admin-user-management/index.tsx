import styles from './styles.module.scss';

import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import moment from 'moment';
import AdminSpacePermissionsPicker from '../admin-space-permissions-picker/index';
import AdminUserManagementRoleRadioList from '../admin-user-management-role-radio-list/index';
import GenericErrorState from '../generic-error-state/index';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  AppScrollView,
  Button,
  ButtonContext,
  Icons,
  InputBox,
  InputBoxContext,
  Modal,
  Skeleton,
} from '@density/ui';

import colorVariables from '@density/ui/variables/colors.json';

import can, { getManageableRoles, ROLE_INFO, PERMISSION_CODES } from '../../helpers/permissions';
import { getChildrenOfSpace } from '../../helpers/filter-hierarchy';
import filterCollection from '../../helpers/filter-collection';
import deduplicate from '../../helpers/deduplicate';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import showToast from '../../actions/toasts';
import updateModal from '../../actions/modal/update';
import collectionUsersCreate from '../../actions/collection/users/create';
import collectionUsersUpdate from '../../actions/collection/users/update';
import collectionUsersInviteResend from '../../actions/collection/users/invite_resend';

import FormLabel from '../form-label';
import ListView, { ListViewColumn, ListViewClickableLink } from '../list-view';

export const INVITATION_STATUS_LABELS = {
  'unsent': 'Unsent',
  'pending': 'Pending',
  'expired': 'Expired',
  'accepted': 'Accepted',
};

const userFilter = filterCollection({fields: ['email', 'fullName']});

function canResendInvitation(user, item) {
  return ['unsent', 'pending', 'expired'].includes(item.invitationStatus) &&
    item.isEditable &&
    item.id !== user.data.id;
}

export function AdminUserManagement({
  spaces,
  spaceHierarchy,
  users,
  user,
  activeModal,
  resizeCounter,

  onClickAddUser,
  onCancelAddUser,
  onUpdateNewUser,
  onSaveNewUser,
  onChangeUserRole,
  onResendInvitation,
  onUpdateUsersFilter,
}) {
  // Stop here if user is still loading
  if (user.loading || !user.data) { return null; }

  // Get roles and filter to visible ("manageable") users
  const manageableRoles = getManageableRoles(user);
  const manageableUsers = users.data.filter(x => {
    return x.isEditable && manageableRoles.indexOf(x.role) > -1;
  });

  // Filter users based on search box
  let filteredUsers = manageableUsers;
  if (users.filters.search) {
    filteredUsers = userFilter(filteredUsers, users.filters.search);
  }

  const showEmptySearchState = users.filters.search && filteredUsers.length === 0;

  return (
    <Fragment>
      {/* If the "add user" modal is visible, render it above the view */}
      {activeModal.name === 'MODAL_ADMIN_USER_ADD' ? (
        <Modal
          visible={activeModal.visible}
          width={783}
          onBlur={onCancelAddUser}
          onEscape={onCancelAddUser}
        >
          <AppBar>
            <AppBarTitle>New User</AppBarTitle>
          </AppBar>
          <div className={styles.adminUserManagementModalColumns}>
            <div className={`${styles.adminUserManagementModalColumn} ${styles.left}`}>
              <AppBar>
                <AppBarTitle>Info</AppBarTitle>
              </AppBar>
              <div style={{padding: '16px 24px'}}>
                <FormLabel
                  label="Email"
                  htmlFor="admin-user-management-new-user-email"
                  input={<InputBox
                    type="text"
                    width="100%"
                    id="admin-user-management-new-user-email"
                    value={activeModal.data.email}
                    placeholder="ex: stuart.little@density.io"
                    onChange={e => onUpdateNewUser({email: e.target.value})}
                  />}
                />
              </div>
              <div className={styles.adminUserManagementNewUserSectionHeader}>
                Roles
              </div>
              <div style={{padding: 24}}>
                <AdminUserManagementRoleRadioList
                  user={user}
                  value={activeModal.data.role}
                  onChange={role => onUpdateNewUser({
                    role,
                    spaceFilteringActive: role === 'owner' ? false : activeModal.data.spaceFilteringActive,
                    spaceIds: role === 'owner' ? [] : activeModal.data.spaceIds,
                  })}
                />
              </div>
            </div>
            <div className={styles.adminUserManagementModalColumn}>
              <AdminSpacePermissionsPicker
                spaces={spaces}
                spaceHierarchy={spaceHierarchy}
                disabled={activeModal.data.role === 'owner'}
                active={activeModal.data.spaceFilteringActive}
                onChangeActive={spaceFilteringActive => onUpdateNewUser({spaceFilteringActive})}
                selectedSpaceIds={activeModal.data.spaceIds}
                onChange={spaceIds => onUpdateNewUser({spaceIds})}
                height={556}
              />
            </div>
          </div>
          <AppBarContext.Provider value="BOTTOM_ACTIONS">
            <AppBar>
              <AppBarSection></AppBarSection>
              <AppBarSection>
                <ButtonContext.Provider value="CANCEL_BUTTON">
                  <Button onClick={onCancelAddUser}>Cancel</Button>
                </ButtonContext.Provider>
                <Button
                  type="primary"
                  disabled={!(
                    activeModal.data.email &&
                    activeModal.data.role && (
                      !activeModal.data.spaceFilteringActive || 
                      activeModal.data.spaceIds.length > 0)
                  )}
                  onClick={() => onSaveNewUser(activeModal.data)}
                >
                  Save user
                </Button>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
        </Modal>
      ) : null}

      <AppBar>
        <AppBarSection>
          <InputBox
            type="text"
            leftIcon={<Icons.Search color={colorVariables.gray} />}
            placeholder={`Search through ${manageableUsers.length} ${manageableUsers.length === 1 ?  'user' : 'users'}`}
            value={users.filters.search}
            width={320}
            onChange={onUpdateUsersFilter}
            disabled={users.view !== 'VISIBLE'}
          />
        </AppBarSection>
        <AppBarSection>
          <Button type="primary" onClick={onClickAddUser}>Add user</Button>
        </AppBarSection>
      </AppBar>

      <AppScrollView backgroundColor={colorVariables.grayLightest}>
        {users.view === 'ERROR' ? (
          <div className={classnames(styles.adminUserManagementList, styles.centered)}>
            <GenericErrorState />
          </div>
        ) : null}
        {users.view === 'LOADING' ? (
          <div className={classnames(styles.adminUserManagementList, {[styles.centered]: showEmptySearchState})}>
            <ListView data={[1, 2]} keyTemplate={n => n}>
              <ListViewColumn title="User" template={() => <Skeleton width={200} />} />
              <ListViewColumn title="Role" template={() => <Skeleton width={80} />} />
              <ListViewColumn flexGrow={1} flexShrink={1} />
              <ListViewColumn title="Activity" template={() => <Skeleton width={80} />} />
              <ListViewColumn title="Invitation" template={() => <Skeleton width={100} />} />
              <ListViewColumn />
              <ListViewColumn title="Space access" template={() => <Skeleton />} />
              <ListViewColumn title="Actions" template={() => <Skeleton />} />
            </ListView>
          </div>
        ) : null}
        {users.view === 'VISIBLE' ? (
          <div className={classnames(styles.adminUserManagementList, {[styles.centered]: showEmptySearchState})}>
            {showEmptySearchState ? (
              <div className={styles.adminUserManagementEmptySearchState}>
                <h2>Whoops</h2>
                <p>We couldn't find a person that matched "{users.filters.search}"</p>
              </div>
            ) : (
              <ListView data={filteredUsers}>
                <ListViewColumn title="User" template={item => (
                  <span className={styles.adminUserManagementCellNameEmailCell}>
                    <h5>{item.fullName || '---'}</h5>
                    <span>{item.email}</span>
                  </span>
                )} />
                <ListViewColumn
                  title={(
                    <Fragment>
                      <span style={{paddingRight: 8}}>Role</span>
                      <AdminUserManagementInfo width={500} anchor="left">
                        <ul className={styles.adminUserManagementInfoUl}>
                          <li><strong>Owner</strong>: Full access and all permissions within an organization</li>
                          <li><strong>Admin</strong>: Edit spaces and users. Cannot make changes to the organization.</li>
                          <li><strong>Read-only</strong>: Cannot make changes to the organization or team.</li>
                        </ul>
                      </AdminUserManagementInfo>
                    </Fragment>
                  )}
                  template={item => ROLE_INFO[item.role].label}
                />
                <ListViewColumn flexGrow={1} flexShrink={1} />
                <ListViewColumn title="Activity" template={item => {
                  const daysIdle = moment.utc().diff(moment.utc(item.lastLogin), 'days');
                  return daysIdle < 7 ? 'Active\u00a0in last\u00a07\u00a0days' : 'Inactive';
                }} />
                <ListViewColumn
                  title="Invitation"
                  template={item => (
                    <Fragment>
                      <span className={styles.adminUserManagementCellInvitationStatus}>
                        {INVITATION_STATUS_LABELS[item.invitationStatus]}
                      </span>
                      {canResendInvitation(user, item) ? (
                        <span
                          role="button"
                          className={styles.adminUserManagementCellInvitationResend}
                          onClick={() => onResendInvitation(item)}
                        >
                          <Icons.Refresh color={colorVariables.brandPrimary} />
                        </span>
                      ) : null}
                    </Fragment>
                  )}
                />
                <ListViewColumn
                />
                <ListViewColumn
                  title={(
                    <span style={{paddingRight: 8}}>Space access</span>
                  )}
                  template={item => {
                    if (!item.isEditable) {
                      return <span>Some spaces</span>;
                    } else {
                      const userSpaces = (item.spaces || []).reduce((acc, next) => {
                        const space = spaces.data.find(s => s.id === next);
                        return deduplicate(acc.concat(getChildrenOfSpace(spaces.data, space)));
                      }, []);
                      return <span>
                        {userSpaces.length || 'All'}
                        {' space'}
                        {userSpaces.length === 1 ? '' : 's'}
                      </span>;
                    }
                  }}
                  flexShrink={0}
                />
                <ListViewColumn
                  title="Actions"
                  template={item => item.isEditable && item.id !== user.data.id ? (
                    <ListViewClickableLink onClick={() => window.location.href = `#/admin/user-management/${item.id}`}>
                      Edit
                    </ListViewClickableLink>
                  ) : null}
                  flexShrink={0}
                />
              </ListView>
            )}
          </div>
        ) : null}
      </AppScrollView>
    </Fragment>
  );
}

type AdminUserManagementInfoProps = {
  width?: number,
  anchor?: 'left' | 'right',
  children: any,
};

function AdminUserManagementInfo({width=400, anchor='left', children }: AdminUserManagementInfoProps) {
  const [opened, setOpened] = useState(false);
  const infoIconWidth = 18;

  let marginLeft;
  if (anchor === 'left') {
    marginLeft = 0;
  } else if (anchor === 'right') {
    marginLeft = -1 * (width - infoIconWidth);
  }

  return (
    <span
      className={styles.adminUserManagementInfo}
      onMouseEnter={() => setOpened(true)}
    >
      <Icons.Info width={infoIconWidth} height={infoIconWidth} />
      <div
        className={styles.adminUserManagementInfoPopupBackdrop}
        onMouseEnter={() => setOpened(false)}
        style={{display: opened ? 'block' : 'none'}}
      />
      <div
        className={classnames(styles.adminUserManagementInfoPopup, {[styles.opened]: opened})}
        style={{marginLeft, width}}
      >
        <div className={styles.adminUserManagementInfoPopupContents}>
          {children}
        </div>
      </div>
    </span>
  );
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    spaceHierarchy: state.spaceHierarchy,
    users: state.users,
    user: state.user,
    activeModal: state.activeModal,
    resizeCounter: state.resizeCounter,
  };
}, dispatch => {
  return {
    onClickAddUser() {
      (dispatch as any)(showModal('MODAL_ADMIN_USER_ADD', {
        email: '',
        role: null,
        spaceFilteringActive: false,
        spaceIds: [],
      }));
    },
    onCancelAddUser() {
      (dispatch as any)(hideModal());
    },
    onUpdateNewUser(updates) {
      dispatch(updateModal(updates));
    },
    onSaveNewUser(data) {
      (dispatch as any)(hideModal());
      (dispatch as any)(collectionUsersCreate(data));
    },
    async onChangeUserRole(user, role) {
      const ok = await (dispatch as any)(collectionUsersUpdate({ id: user.id, role }));
      if (ok) {
        dispatch<any>(showToast({ text: 'User role updated successfully' }));
      } else {
        dispatch<any>(showToast({ type: 'error', text: 'Error updating user role' }));
      }
    },
    onCancelDeleteUser() {
      (dispatch as any)(hideModal());
    },
    onResendInvitation(user) {
      (dispatch as any)(collectionUsersInviteResend(user));
    },
    onUpdateUsersFilter(event) {
      dispatch({type: 'COLLECTION_USERS_FILTER', filter: 'search', value: event.target.value });
    }
  };
})(AdminUserManagement);
