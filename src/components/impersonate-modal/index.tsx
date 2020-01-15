import React, { useEffect, useRef } from 'react';
import { ROLE_INFO } from '../../helpers/permissions/index';

import { CoreUser } from '@density/lib-api-types/core-v2/users';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  Button,
  ButtonGroup,
  Icons,
  InputBox,
  ListView,
  ListViewColumn,
  RadioButton,
  Switch,
  Modal,
} from '@density/ui/src';
import colorVariables from '@density/ui/variables/colors.json';

import accounts from '../../client/accounts';
import filterCollection from '../../helpers/filter-collection';

import hideModal from '../../rx-actions/modal/hide';
import updateModal from '../../rx-actions/modal/update';
import impersonateSet from '../../rx-actions/impersonate';

import styles from './styles.module.scss';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore from '../../rx-stores/active-modal';

const orgFilterHelper = filterCollection({fields: ['name']});
const userFilterHelper = filterCollection({fields: ['email', 'full_name']});

function onSelectImpersonateOrganization(dispatch, org, userInputRef) {
  updateModal(dispatch, {
    loading: true,
    selectedOrganization: org,
    selectedUser: null
  });

  // Don't use a configured axios client here as it will pass the impersonate header
  fetch(`${accounts().defaults.baseURL}/users?organization_id=${org.id}`, {
    headers: { 'Authorization': accounts().defaults.headers.common['Authorization'] }
  }).then(response => response.json()).then(data => {
    updateModal(dispatch, {loading: false, users: data as Array<CoreUser>});
    userInputRef.current.focus();
  });
}

export default function ImpersonateModal() {
  const activeModal = useRxStore(ActiveModalStore);
  const dispatch = useRxDispatch();

  const loading = !!activeModal.data.loading;
  const enabled = !!activeModal.data.enabled;

  const filteredOrgs = orgFilterHelper(
    activeModal.data.organizations,
    activeModal.data.organizationFilter
  );
  const filteredUsers = userFilterHelper(
    activeModal.data.users.filter(x => x.role !== 'service'),
    activeModal.data.userFilter
  );

  // Focus the "org" input when the modal is newly visible
  const orgInputRef = useRef<HTMLElement>();
  useEffect(
    () => (activeModal.visible && orgInputRef.current && orgInputRef.current.focus()) || undefined,
    [activeModal.visible]
  );
  
  // Focus the "user" input ref when an org is selected
  const userInputRef = useRef<HTMLElement>();

  return <Modal
    width={800}
    height={600}
    visible={activeModal.visible}
    onBlur={() => hideModal(dispatch)}
    onEscape={() => hideModal(dispatch)}
  >
    <AppBar>
      <AppBarSection>
        <AppBarTitle>User Impersonation</AppBarTitle>
      </AppBarSection>
      <AppBarSection>
        <Switch
          value={enabled}
          onChange={event => {
            updateModal(dispatch, {
              enabled: event.target.checked,
              selectedOrganization: null,
              users: [],
              selectedUser: null,
            });
          }}
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
            ref={orgInputRef}
            width="100%"
            placeholder='ex: "Density Dev", "Acme Co"'
            leftIcon={<Icons.Search color={colorVariables.gray} />}
            disabled={!enabled}
            value={activeModal.data.organizationFilter}
            onKeyPress={e => {
              if (e.key === 'Enter' && filteredOrgs.length > 0) {
                onSelectImpersonateOrganization(
                  dispatch,
                  activeModal.data.organizations.find(x => x.id === filteredOrgs[0].id),
                  userInputRef
                );
              }
            }}
            onChange={e => {
              updateModal(dispatch, {
                organizationFilter: e.target.value,
                userFilter: activeModal.data.userFilter
              });
            }} />
        </AppBar>
        <div style={{
          flexGrow: 1,
          padding: '0 24px',
          overflowY: enabled ? 'scroll' : 'hidden',
        }}>
          <ListView data={filteredOrgs} showHeaders={false}>
            <ListViewColumn
              width="auto"
              disabled={item => loading || !enabled}
              onClick={item => onSelectImpersonateOrganization(
                dispatch,
                activeModal.data.organizations.find(x => x.id === item.id),
                userInputRef
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
            ref={userInputRef}
            width="100%"
            placeholder='ex: "John Denver"'
            leftIcon={<Icons.Search color={colorVariables.gray} />}
            disabled={!enabled}
            value={activeModal.data.userFilter}
            onChange={e => {
              updateModal(dispatch, {
                organizationFilter: activeModal.data.organizationFilter,
                userFilter: e.target.value
              });
            }} />
        </AppBar>
        <div style={{
          flexGrow: 1,
          padding: '12px 24px',
          overflowY: enabled ? 'scroll' : 'hidden',
        }}>
          {filteredUsers.map(item => {
            const label = item.full_name || item.email;
            const selected = (activeModal.data.selectedUser || {}).id === item.id;
            const disabled = loading || !enabled;
            return <div
              key={item.id}
              className={styles.impersonateUserListItem}
              style={{
                opacity: enabled ? 1.0 : 0.25,
                cursor: enabled ? 'pointer' : undefined,
                color: selected ? colorVariables.brandPrimary: undefined,
              }}
              onClick={() => {
                const user = activeModal.data.users.find(x => x.id === item.id);
                updateModal(dispatch, {selectedUser: user});
              }}
            >
              <div className={styles.impersonateUserIcon}>{
                (item.full_name || '')
                  .split(' ')
                  .slice(0, 2)
                  .filter(word => word.length > 0)
                  .map(word => word[0].toUpperCase())
                  .join('')
              }</div>
              <div style={{flexGrow: 1}}>
                {label.slice(0, 24)}
                {label.length > 24 ? '...' : ''}
                {' '}({ROLE_INFO[item.role].label})
              </div>
              <RadioButton
                name="modal-impersonate-user"
                checked={selected}
                disabled={disabled}
                value={item.id}
                onChange={e => null} />
            </div>;
          })}
        </div>
      </div>
    </div>
    <AppBarContext.Provider value="BOTTOM_ACTIONS">
      <AppBar>
        <AppBarSection></AppBarSection>
        <AppBarSection>
          <ButtonGroup>
            <Button variant="underline" onClick={() => hideModal(dispatch)}>Cancel</Button>
            <Button
              variant="filled"
              type="primary"
              disabled={loading || (enabled && !activeModal.data.selectedUser)}
              onClick={() => {
                const impersonate = activeModal.data;
                dispatch(impersonateSet(impersonate.enabled ? impersonate : null));
                hideModal(dispatch);
              }}
            >Save settings</Button>
          </ButtonGroup>
        </AppBarSection>
      </AppBar>
    </AppBarContext.Provider>
  </Modal>;
}
