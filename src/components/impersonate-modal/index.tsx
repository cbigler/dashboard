import React from 'react';
import { connect } from 'react-redux';
import { ROLE_INFO } from '../../helpers/permissions/index';

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

  const loading = !!activeModal.data.loading;
  const enabled = !!activeModal.data.enabled;

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
          value={enabled}
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
            disabled={!enabled}
            value={activeModal.data.organizationFilter}
            onChange={e => onSetImpersonateFilters(e.target.value, activeModal.data.userFilter)} />
        </AppBar>
        <div style={{
          flexGrow: 1,
          padding: '0 24px',
          overflowY: enabled ? 'scroll' : 'hidden',
        }}>
          <ListView data={filteredOrgs} showHeaders={false}>
            <ListViewColumn
              style={{flexGrow: 1}}
              disabled={item => loading || !enabled}
              onClick={item => onSelectImpersonateOrganization(
                activeModal.data.organizations.find(x => x.id === item.id)
              )}
              template={item => <div style={{opacity: enabled ? 1.0 : 0.25}}>
                <RadioButton
                  name="modal-impersonate-organization"
                  checked={(activeModal.data.selectedOrganization || {}).id === item.id}
                  disabled={loading || !enabled}
                  value={item.id}
                  text={item.name}
                  onChange={e => null} />
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
            disabled={!enabled}
            value={activeModal.data.userFilter}
            onChange={e => onSetImpersonateFilters(activeModal.data.organizationFilter, e.target.value)} />
        </AppBar>
        <div style={{
          flexGrow: 1,
          padding: '0 24px',
          overflowY: enabled ? 'scroll' : 'hidden',
        }}>
          <ListView data={filteredUsers} showHeaders={false}>
            <ListViewColumn
              style={{flexGrow: 1}}
              disabled={item => loading || !enabled}
              onClick={item => onSelectImpersonateUser(
                activeModal.data.users.find(x => x.id === item.id)
              )}
              template={item => {
                const selected = (activeModal.data.selectedUser || {}).id === item.id;
                return <div
                  className="impersonate-user-list-item"
                  style={{
                    opacity: enabled ? 1.0 : 0.25,
                    color: selected ? colorVariables.brandPrimary: undefined
                  }}
                >
                  <div className="impersonate-user-icon">
                    {
                      (item.fullName || '')
                        .split(' ')
                        .slice(0, 2)
                        .filter(word => word.length > 0)
                        .map(word => word[0].toUpperCase())
                        .join('')
                    }
                  </div>
                  <div style={{flexGrow: 1}}>
                    {(item.fullName || item.email).slice(0, 64)}
                    {' '}({ROLE_INFO[item.role].label})
                  </div>
                  <RadioButton
                    name="modal-impersonate-user"
                    checked={selected}
                    disabled={loading || !enabled}
                    value={item.id}
                    onChange={e => null} />
                </div>;
              }} />
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
            disabled={loading || (enabled && !activeModal.data.selectedUser)}
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
      dispatch(updateModal({
        loading: true,
        selectedOrganization: org,
        selectedUser: null
      }));

      // Don't use a configured axios client here as it will pass the impersonate header
      fetch(`${accounts().defaults.baseURL}/users?organization_id=${org.id}`, {
        headers: { 'Authorization': accounts().defaults.headers.common['Authorization'] }
      }).then(response => response.json()).then(data => {
        dispatch(updateModal({loading: false, users: data.map(objectSnakeToCamel)}));
      });
    },
    onSelectImpersonateUser(user) {
      dispatch(updateModal({selectedUser: user}));
    }
  };
})(ImpersonateModal);
