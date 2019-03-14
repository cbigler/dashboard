import React, { Fragment } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import moment from 'moment';
import AdminSpacePermissionsPicker from '../admin-space-permissions-picker/index';
import AdminUserManagementRoleRadioList from '../admin-user-management-role-radio-list/index';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  AppScrollView,
  Button,
  Icons,
  InputBox,
  InputBoxContext,
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import can, { getManageableRoles, ROLE_INFO, PERMISSION_CODES } from '../../helpers/permissions';
import filterCollection from '../../helpers/filter-collection';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import showToast from '../../actions/toasts';
import updateModal from '../../actions/modal/update';
import collectionUsersCreate from '../../actions/collection/users/create';
import collectionUsersUpdate from '../../actions/collection/users/update';
import collectionUsersInviteResend from '../../actions/collection/users/invite_resend';

import Dialogger from '../dialogger';
import FormLabel from '../form-label';
import Modal from '../modal';
import ListView, { ListViewColumn, LIST_CLICKABLE_STYLE } from '../list-view';
import { CancelLink } from '../dialogger';

const INVITATION_STATUS_LABELS = {
  'unsent': 'unsent',
  'pending': 'pending',
  'expired': 'expired',
  'accepted': 'accepted',
};

const userFilter = filterCollection({fields: ['email', 'fullName']});

function canResendInvitation(user, item) {
  return ['unsent', 'pending'].includes(item.invitationStatus) && item.id !== user.data.id;
}

export function AdminUserManagement({
  spaces,
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
  const manageableUsers = users.data.filter(x => manageableRoles.indexOf(x.role) > -1);

  // Filter users based on search box
  let filteredUsers = manageableUsers;
  if (users.filters.search) {
    filteredUsers = userFilter(filteredUsers, users.filters.search);
  }

  return <Fragment>
    {/* Display user delete confirmation dialog */}
    <Dialogger />

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
        <div className="admin-user-management-modal-columns">
          <div className="admin-user-management-modal-column left">
            <AppBar>
              <AppBarTitle>Info</AppBarTitle>
            </AppBar>
            <div style={{padding: '16px 24px'}}>
              <FormLabel
                className="admin-user-management-new-user-email-container"
                label="Email"
                htmlFor="admin-user-management-new-user-email"
                input={<InputBox
                  type="text"
                  width="100%"
                  className="admin-user-management-new-user-email-field"
                  id="admin-user-management-new-user-email"
                  value={activeModal.data.email}
                  placeholder="ex: stuart.little@density.io"
                  onChange={e => onUpdateNewUser('email', e.target.value)}
                />}
              />
            </div>
            <div className="admin-user-management-new-user-section-header">
              Roles
            </div>
            <div style={{padding: 24}}>
              <AdminUserManagementRoleRadioList
                user={user}
                value={activeModal.data.role}
                onChange={role => onUpdateNewUser('role', role)}
              />
            </div>
          </div>
          <div className="admin-user-management-modal-column right">
            <AdminSpacePermissionsPicker
              spaces={spaces}
              initialSelectedSpaceIds={[]}
            />
          </div>
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection></AppBarSection>
            <AppBarSection>
              <CancelLink onClick={onCancelAddUser} />
              <Button
                type="primary"
                disabled={!(activeModal.data.email && activeModal.data.role)}
                onClick={() => onSaveNewUser(activeModal.data)}
              >
                Save User
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
          onChange={onUpdateUsersFilter} />
      </AppBarSection>
      <AppBarSection>
        <Button type="primary" onClick={onClickAddUser}>Add User</Button>
      </AppBarSection>
    </AppBar>

    <AppScrollView>
      <div className="admin-user-management-list">
        <ListView data={filteredUsers}>
          <ListViewColumn title="User" template={item => (
            <span className="admin-user-management-cell-name-email-cell">
              <h5>{item.fullName}</h5>
              <span>{item.email}</span>
            </span>
          )} />
          <ListViewColumn
            title={<span style={{paddingLeft: 16}}>Role</span>}
            template={item => <div style={{opacity: item.id === user.data.id ? 0.5 : 1.0}}>
              <InputBoxContext.Provider value="LIST_VIEW">
                <InputBox
                  type="select"
                  width="160px"
                  value={item.role}
                  disabled={item.id === user.data.id}
                  onChange={value => onChangeUserRole(item, value.id)}
                  choices={manageableRoles.map(x => ({id: x, label: ROLE_INFO[x].label}))} />
              </InputBoxContext.Provider>
            </div>}
          />
          <ListViewColumn style={{flexGrow: 1, flexShrink: 1}} />
          <ListViewColumn title="Activity" template={item => {
            const daysIdle = moment.utc().diff(moment.utc(item.lastLogin), 'days');
            return daysIdle < 7 ? 'Active\u00a0in last\u00a07\u00a0days' : 'Inactive';
          }} />
          <ListViewColumn
            title="Invitation"
            template={item => (
              <Fragment>
                <span className="admin-user-management-cell-invitation-status">
                  {INVITATION_STATUS_LABELS[item.invitationStatus]}
                </span>
                {canResendInvitation(user, item) ? (
                  <span
                    role="button"
                    className="admin-user-management-cell-invitation-resend"
                    onClick={() => onResendInvitation(item)}
                  >
                    <Icons.Refresh color={colorVariables.brandPrimary} />
                  </span>
                ) : null}
              </Fragment>
            )}
          />
          <ListViewColumn
            template={item => canResendInvitation(user, item) ? 
              <span style={LIST_CLICKABLE_STYLE}>Resend</span> : ''}
            disabled={item => !canResendInvitation(user, item)}
            onClick={item => onResendInvitation(item)}
          />
          <ListViewColumn
            title="Space Access"
            template={item =><span>All Spaces</span>}
          />
          <ListViewColumn
            title="Actions"
            template={item => (
              <span
                role="button"
                className="admin-user-management-edit-user"
              >Edit User</span>
            )}
            disabled={item => item.id === user.data.id}
            onClick={item => { window.location.href = `#/admin/user-management/${item.id}` }}
          />
        </ListView>
      </div>
    </AppScrollView>
  </Fragment>;
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    users: state.users,
    user: state.user,
    activeModal: state.activeModal,
    resizeCounter: state.resizeCounter,
  };
}, dispatch => {
  return {
    onClickAddUser() {
      (dispatch as any)(showModal('MODAL_ADMIN_USER_ADD', {email: '', role: null}));
    },
    onCancelAddUser() {
      (dispatch as any)(hideModal());
    },
    onUpdateNewUser(field, value) {
      dispatch(updateModal(field, value));
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
