import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

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
  RadioButton,
  RadioButtonContext,
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import can, { PERMISSION_CODES } from '../../helpers/permissions';
import filterCollection from '../../helpers/filter-collection';

import showToast from '../../actions/toasts';
import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import updateModal from '../../actions/modal/update';
import collectionUsersCreate from '../../actions/collection/users/create';
import collectionUsersUpdate from '../../actions/collection/users/update';
import collectionUsersDestroy from '../../actions/collection/users/destroy';
import collectionUsersInviteResend from '../../actions/collection/users/invite_resend';

import Dialogger from '../dialogger';
import FormLabel from '../form-label';
import Modal from '../modal';
import ListView, { ListViewColumn, LIST_CLICKABLE_STYLE } from '../list-view';
import { CancelLink } from '../dialogger';

const INVITATION_STATUS_LABELS = {
  'unsent': 'Unsent',
  'pending': 'Pending',
  'expired': 'Expired',
  'accepted': 'Accepted',
};

const ROLE_INFO = {
  'owner': {
    label: 'Owner',
    description: 'Full access and all permissions, including developer tools.'
  },
  'admin': {
    label: 'Admin',
    description: 'Edit spaces and users. Cannot access developer tools.'
  },
  'readonly': {
    label: 'Read-Only',
    description: 'Cannot make changes to spaces or users.'
  },
}

const userFilter = filterCollection({fields: ['email', 'fullName']});

function getManageableRoles(user) {
  const roles: string[] = [];
  if (can(user, PERMISSION_CODES.owner_user_manage)) { roles.push('owner'); }
  if (can(user, PERMISSION_CODES.admin_user_manage)) { roles.push('admin'); }
  if (can(user, PERMISSION_CODES.readonly_user_manage)) { roles.push('readonly'); }
  return roles;
}

function canResendInvitation(user, item) {
  return ['unsent', 'pending'].includes(item.invitationStatus) && item.id !== user.data.id;
}

export function AdminUserManagement({
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
  onStartDeleteUser,
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
        width={480}
        onBlur={onCancelAddUser}
        onEscape={onCancelAddUser}
      >
        <div style={{display: 'flex', flexDirection: 'column'}}>
          {/* <div style={{marginTop: -64}}>
            <AppBarContext.Provider value="TRANSPARENT">
              <AppBar>
                <AppBarSection></AppBarSection>
                <AppBarSection>Hi Rob</AppBarSection>
              </AppBar>
            </AppBarContext.Provider>
          </div> */}
          <AppBar>
            <AppBarTitle>New User</AppBarTitle>
          </AppBar>
          <div className="admin-user-management-new-user-section-header">
            Info
          </div>
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
                onChange={e => onUpdateNewUser(activeModal.data, 'email', e.target.value)}
              />}
            />
          </div>
          <div className="admin-user-management-new-user-section-header">
            Roles
          </div>
          <div style={{padding: 24}}>
            {manageableRoles.map(role => (
              <div>
                <RadioButtonContext.Provider value='USER_FORM'>
                  <RadioButton
                    name="admin-user-management-new-user-role"
                    checked={activeModal.data.role === role}
                    onChange={e => onUpdateNewUser(activeModal.data, 'role', e.target.value)}
                    value={role}
                    text={ROLE_INFO[role].label} />
                </RadioButtonContext.Provider>
                <div className="admin-user-management-new-user-role-description">
                  {ROLE_INFO[role].description}
                </div>
              </div>
            ))}
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
                  Save
                </Button>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
        </div>
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
          <ListViewColumn title="Email" template={item => (
            <strong className="admin-user-management-cell-value">{item.email}</strong>
          )} />
          <ListViewColumn title="Name" template={item => (
            <span className="admin-user-management-cell-value">{item.fullName}</span>
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
            template={item => INVITATION_STATUS_LABELS[item.invitationStatus]}
          />
          <ListViewColumn 
            template={item => canResendInvitation(user, item) ? (
              <span style={LIST_CLICKABLE_STYLE}>Resend</span>
            ) : ''}
            disabled={item => !canResendInvitation(user, item)}
            onClick={item => onResendInvitation(item)}
          />
          <ListViewColumn
            template={item => <div style={{opacity: item.id === user.data.id ? 0.5 : 1.0}}>
              <Icons.Trash color={colorVariables.grayDarker} />
            </div>}
            disabled={item => item.id === user.data.id}
            onClick={item => onStartDeleteUser(item)}
          />
        </ListView>
      </div>
    </AppScrollView>
  </Fragment>;
}

export default connect((state: any) => {
  return {
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
    onUpdateNewUser(data, field, value) {
      dispatch(updateModal({ ...data, [field]: value }));
    },
    onSaveNewUser(data) {
      (dispatch as any)(hideModal());
      (dispatch as any)(collectionUsersCreate(data));
    },
    async onChangeUserRole(user, role) {
      const ok = await (dispatch as any)(collectionUsersUpdate({ id: user.id, role }));
      if (ok) {
        dispatch<any>(showToast({ text: 'User role updated.' }));
      } else {
        dispatch<any>(showToast({ type: 'error', text: 'Error updating user role' }));
      }
    },
    onStartDeleteUser(user) {
      (dispatch as any)(showModal('MODAL_CONFIRM', {
        prompt: 'Are you sure you want to delete this user?',
        confirmText: 'Delete',
        callback: () => (dispatch as any)(collectionUsersDestroy(user))
      }));
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
