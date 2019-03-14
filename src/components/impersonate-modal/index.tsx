import React from 'react';
import { connect } from 'react-redux';
import axios from 'axios';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  Button,
  Icons,
  InputBox,
  RadioButton,
  Switch
} from "@density/ui";
import colorVariables from '@density/ui/variables/colors.json';

import accounts from '../../client/accounts';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import filterCollection from '../../helpers/filter-collection';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import updateModal from '../../actions/modal/update';
import impersonateSet from '../../actions/impersonate';

import { CancelLink } from '../dialogger';
import ListView, { ListViewColumn } from '../list-view';
import Modal from '../modal';

const orgFilterHelper = filterCollection({fields: ['name']});
const userFilterHelper = filterCollection({fields: ['email', 'fullName']});

export function ImpersonateModal({
  activeModal,
  onSaveImpersonate,
  onCancelImpersonate,
  onSetImpersonateEnabled,
  onSetImpersonateFilters,
  onSelectImpersonateOrganization,
  onSelectImpersonateUser,
}) {

  const filteredOrgs = orgFilterHelper(
    activeModal.data.organizations,
    activeModal.data.organizationFilter
  );
  const filteredUsers = userFilterHelper(
    activeModal.data.users,
    activeModal.data.userFilter
  );

  return <Modal
    width={800}
    height={600}
    visible={activeModal.visible}
    onBlur={onCancelImpersonate}
    onEscape={onCancelImpersonate}
  >
    <AppBar>
      <AppBarSection>
        <AppBarTitle>User Impersonation</AppBarTitle>
      </AppBarSection>
      <AppBarSection>
        <Switch
          value={!!activeModal.data.enabled}
          onChange={event => onSetImpersonateEnabled(event.target.checked)}
        />
      </AppBarSection>
    </AppBar>
    <div style={{display: 'flex', height: 472}}>
      <div style={{
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${colorVariables.grayLight}`
      }}>
        <AppBar>
          <span style={{fontSize: 20}}>Organization</span>
        </AppBar>
        <AppBar>
          <InputBox
            width="100%"
            placeholder='ex: "Density Dev", "Acme Co"'
            leftIcon={<Icons.Search color={colorVariables.gray} />}
            disabled={!activeModal.data.enabled}
            value={activeModal.data.organizationFilter}
            onChange={e => onSetImpersonateFilters(e.target.value, activeModal.data.userFilter)} />
        </AppBar>
        <div style={{
          flexGrow: 1,
          padding: '0 24px',
          overflowY: activeModal.data.enabled ? 'scroll' : 'hidden',
        }}>
          <ListView data={filteredOrgs} showHeaders={false}>
            <ListViewColumn
              style={{flexGrow: 1}}
              disabled={item => !activeModal.data.enabled}
              onClick={item => onSelectImpersonateOrganization(
                activeModal.data.organizations.find(x => x.id === item.id)
              )}
              template={item => <div style={{opacity: activeModal.data.enabled ? 1.0 : 0.5}}>
                <RadioButton
                  name="modal-impersonate-organization"
                  checked={(activeModal.data.selectedOrganization || {}).id === item.id}
                  disabled={!activeModal.data.enabled}
                  value={item.id}
                  text={item.name}
                  readOnly={true} />
              </div>}
            />
          </ListView>
        </div>
      </div>
      <div style={{
        width: '50%',
        display: 'flex',
        flexDirection: 'column',
        background: colorVariables.grayLightest
      }}>
        <div style={{background: '#FFF'}}><AppBar>
          <span style={{fontSize: 20}}>User</span>
        </AppBar></div>
        <AppBar>
          <InputBox
            width="100%"
            placeholder='ex: "John Denver"'
            leftIcon={<Icons.Search color={colorVariables.gray} />}
            disabled={!activeModal.data.enabled}
            value={activeModal.data.userFilter}
            onChange={e => onSetImpersonateFilters(activeModal.data.organizationFilter, e.target.value)} />
        </AppBar>
        <div style={{
          flexGrow: 1,
          padding: '0 24px',
          overflowY: activeModal.data.enabled ? 'scroll' : 'hidden',
        }}>
          <ListView data={filteredUsers} showHeaders={false}>
            <ListViewColumn
              style={{flexGrow: 1}}
              disabled={item => !activeModal.data.enabled}
              onClick={item => onSelectImpersonateUser(
                activeModal.data.users.find(x => x.id === item.id)
              )}
              template={item => <div style={{opacity: activeModal.data.enabled ? 1.0 : 0.5}}>
                <RadioButton
                  name="modal-impersonate-user"
                  checked={(activeModal.data.selectedUser || {}).id === item.id}
                  disabled={!activeModal.data.enabled}
                  value={item.id}
                  text={item.fullName || item.email}
                  readOnly={true} />
              </div>}
            />
          </ListView>
        </div>
      </div>
    </div>
    <AppBarContext.Provider value="BOTTOM_ACTIONS">
      <AppBar>
        <AppBarSection></AppBarSection>
        <AppBarSection>
          <CancelLink text="Cancel" onClick={onCancelImpersonate} />
          <Button
            type="primary"
            disabled={activeModal.data.enabled && !activeModal.data.selectedUser}
            onClick={() => onSaveImpersonate(activeModal.data)}
          >Save Settings</Button>
        </AppBarSection>
      </AppBar>
    </AppBarContext.Provider>
  </Modal>;
}

export default connect((state: any) => {
  return {
    activeModal: state.activeModal
  };
}, (dispatch: any) => {
  return {
    async onShowImpersonate(impersonate) {
      if (!impersonate.enabled) {
        impersonate.organizations = (await accounts().get('/organizations')).data;
        dispatch(impersonateSet(impersonate));
      }
      dispatch(showModal('MODAL_IMPERSONATE', {
        ...impersonate,
        enabled: true
      }));
    },
    onSaveImpersonate(impersonate) {
      dispatch(impersonateSet(impersonate.enabled ? impersonate : null));
      dispatch(hideModal());
    },
    onCancelImpersonate() {
      dispatch(hideModal());
    },

    onSetImpersonateEnabled(value) {
      dispatch(updateModal({
        enabled: value,
        selectedOrganization: null,
        users: [],
        selectedUser: null,
      }));
    },
    onSetImpersonateFilters(organizationFilter, userFilter) {
      dispatch(updateModal({
        organizationFilter: organizationFilter,
        userFilter: userFilter
      }));
    },
    onSelectImpersonateOrganization(org) {
      // Don't use a configured axios client here as it will pass the impersonate header
      fetch(`${accounts().defaults.baseURL}/users?organization_id=${org.id}`, {
        headers: { 'Authorization': accounts().defaults.headers.common['Authorization'] }
      }).then(response => response.json()).then(data => {
        dispatch(updateModal({selectedOrganization: org}));
        dispatch(updateModal({users: data.map(objectSnakeToCamel)}));
      });
    },
    onSelectImpersonateUser(user) {
      dispatch(updateModal({selectedUser: user}));
    }
  };
})(ImpersonateModal);
