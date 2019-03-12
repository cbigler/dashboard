import React from 'react';
import { connect } from 'react-redux';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  Button,
  Icons,
  InputBox,
  RadioButton,
  Switch,
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

import { accounts } from '../../client';

import stringToBoolean from '../../helpers/string-to-boolean/index';

import Modal from '../modal';
import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import updateModal from '../../actions/modal/update';
import impersonateSet from '../../actions/impersonate';

import ListView, { ListViewColumn } from '../list-view';
import { CancelLink } from '../dialogger';

import Explore from '../explore/index';
import Login from '../login/index';
import Admin from '../admin/index';
import Account from '../account/index';
import AccountRegistration from '../account-registration/index';
import AccountForgotPassword from '../account-forgot-password/index';
import LiveSpaceList from '../live-space-list/index';
import LiveSpaceDetail from '../live-space-detail/index';
import DashboardsList from '../dashboards-list/index';

import AccountSetupOverview from '../account-setup-overview/index';
import AccountSetupDoorwayList from '../account-setup-doorway-list/index';
import AccountSetupDoorwayDetail from '../account-setup-doorway-detail/index';

import Dashboard from '../dashboard/index';
import AppNavbar from '../app-navbar/index';

import UnknownPage from '../unknown-page/index';
import objectSnakeToCamel from '../../helpers/object-snake-to-camel';

function App({
  activePage,
  activeModal,
  user,
  impersonate,
  settings,
  
  onShowImpersonate,
  onSaveImpersonate,
  onCancelImpersonate,
  onSetImpersonateEnabled,
  onSelectImpersonateOrganization,
  onSelectImpersonateUser,
}) {
  return (
    <div className="app">
      {/* Impersonation modal */}
      {activeModal.name === 'MODAL_IMPERSONATE' ? <Modal
        width={800}
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
        <div style={{display: 'flex', maxHeight: 480}}>
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
                disabled={!activeModal.data.enabled} />
            </AppBar>
            <div style={{
              flexGrow: 1,
              padding: '0 24px',
              overflowY: activeModal.data.enabled ? 'scroll' : 'hidden',
            }}>
              <ListView data={activeModal.data.organizations} showHeaders={false}>
                <ListViewColumn
                  style={{flexGrow: 1}}
                  template={item => <RadioButton
                    name="modal-impersonate-organization"
                    checked={(activeModal.data.selectedOrganization || {}).id === item.id}
                    disabled={!activeModal.data.enabled}
                    value={item.id}
                    text={item.name}
                    onChange={event => onSelectImpersonateOrganization(
                      activeModal.data.organizations.find(x => x.id === event.target.value)
                    )} />}
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
                disabled={!activeModal.data.enabled} />
            </AppBar>
            <div style={{
              flexGrow: 1,
              padding: '0 24px',
              overflowY: activeModal.data.enabled ? 'scroll' : 'hidden',
            }}>
              <ListView data={activeModal.data.users} showHeaders={false}>
                <ListViewColumn
                  style={{flexGrow: 1}}
                  template={item => <RadioButton
                    name="modal-impersonate-user"
                    checked={(activeModal.data.selectedUser || {}).id === item.id}
                    disabled={!activeModal.data.enabled}
                    value={item.id}
                    text={item.fullName}
                    onChange={event => onSelectImpersonateUser(
                      activeModal.data.users.find(x => x.id === event.target.value)
                    )} />}
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
                disabled={!activeModal.data.selectedUser}
                onClick={() => onSaveImpersonate(activeModal.data)}
              >Save Settings</Button>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal> : null}

      {/* Render the navbar */}
      {(function(activePage) {
        switch (activePage) {
          // On these special pages, don't render a navbar
          case 'BLANK':
          case 'LOGIN':
          case 'ACCOUNT_REGISTRATION':
          case 'ACCOUNT_FORGOT_PASSWORD':
          case 'LIVE_SPACE_DETAIL':
            return null;

          // Render the logged-in navbar by default
          default:
            return <AppNavbar
              page={activePage}
              user={user}
              settings={settings}
              impersonate={impersonate}
              onClickImpersonate={() => onShowImpersonate(impersonate)}
            />;
        }
      })(activePage)}

      {/* Insert the currently displayed page into the view */}
      <ActivePage
        activePage={activePage}
        user={user}
        settings={settings}
      />
    </div>
  );
}

function ActivePage({activePage, user, settings}) {
  switch (activePage) {
  case "LOGIN":
    return <Login />;
  case "ADMIN_USER_MANAGEMENT":
  case "ADMIN_DEVELOPER":
  case "ADMIN_DEVICE_STATUS":
    return <Admin user={user} activePage={activePage} />;
  case "LIVE_SPACE_LIST":
    return stringToBoolean(settings.insightsPageLocked) ? null : <LiveSpaceList />;
  case "LIVE_SPACE_DETAIL":
    return <LiveSpaceDetail />;
  case "EXPLORE":
    return <Explore activePage={activePage} />;
  case "EXPLORE_SPACE_TRENDS":
  case "EXPLORE_SPACE_DAILY":
  case "EXPLORE_SPACE_DATA_EXPORT":
    return stringToBoolean(settings.insightsPageLocked) ? null : <Explore activePage={activePage} />;
  case "ACCOUNT":
    return <Account />;
  case "ACCOUNT_REGISTRATION":
    return <AccountRegistration />;
  case "ACCOUNT_FORGOT_PASSWORD":
    return <AccountForgotPassword />;
  case "ACCOUNT_SETUP_OVERVIEW":
    return <AccountSetupOverview />;
  case "ACCOUNT_SETUP_DOORWAY_LIST":
    return <AccountSetupDoorwayList />;
  case "ACCOUNT_SETUP_DOORWAY_DETAIL":
    return <AccountSetupDoorwayDetail />;
  case "DASHBOARD_LIST":
    return <DashboardsList />;
  case "DASHBOARD_DETAIL":
    return <Dashboard />;

  // When logging out, navigate to this page (it's empty) to ensure that removing things like the
  // token doesn't cause weird stuff in components that expect it to exist.
  case "BLANK":
  case "LOGOUT":
    return null;

  default:
    return <UnknownPage invalidUrl={activePage} />;
  }
}


export default connect((state: any) => {
  return {
    activePage: state.activePage,
    activeModal: state.activeModal,
    user: state.user,
    impersonate: state.impersonate,
    settings: (
      state.user &&
      state.user.data &&
      state.user.data.organization &&
      state.user.data.organization.settings
    ) || {}
  };
}, (dispatch: any) => {
  return {
    async onShowImpersonate(impersonate) {
      if (!impersonate.enabled) {
        impersonate.organizations = await accounts.organizations.list();
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
      dispatch(updateModal({enabled: value}));
    },
    onSelectImpersonateOrganization(org) {
      accounts.users.list().then(results => {
        dispatch(updateModal({selectedOrganization: org}));
        dispatch(updateModal({users: results.map(objectSnakeToCamel)}));
      });
    },
    onSelectImpersonateUser(user) {
      dispatch(updateModal({selectedUser: user}));
    }
  };
})(App);
