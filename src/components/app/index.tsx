import React from 'react';
import { connect } from 'react-redux';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  Button,
  InputBox,
} from '@density/ui';

import { accounts } from '../../client';

import stringToBoolean from '../../helpers/string-to-boolean/index';

import Modal from '../modal';
import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import updateModal from '../../actions/modal/update';

import FormLabel from '../form-label';
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
  settings,
  
  onStartImpersonate,
  onCancelImpersonate,
  onSelectImpersonateOrganization,
}) {
  return (
    <div className="app">
      {/* Impersonation modal */}
      {activeModal.name === 'MODAL_IMPERSONATE' ? <Modal
        width={480}
        visible={activeModal.visible}
        onBlur={onCancelImpersonate}
        onEscape={onCancelImpersonate}
      >
        <AppBar><AppBarSection><AppBarTitle>Impersonate</AppBarTitle></AppBarSection></AppBar>
        <div style={{padding: '24px'}}>
          <FormLabel
            className="modal-impersonate-organization-container"
            label="Organization"
            htmlFor="modal-impersonate-organization"
            input={<InputBox
              type="select"
              width="100%"
              className="modal-impersonate-organization-field"
              id="modal-impersonate-organization"
              value={activeModal.data.selectedOrganization}
              choices={activeModal.data.organizations.map(x => ({
                id: x.id,
                label: x.name
              }))}
              onChange={onSelectImpersonateOrganization}
            />}
          />
          <FormLabel
            className="modal-impersonate-user-container"
            label="User"
            htmlFor="modal-impersonate-user"
            input={<InputBox
              type="select"
              width="100%"
              className="modal-impersonate-user-field"
              id="modal-impersonate-user"
              value={activeModal.data.selectedUser}
              choices={activeModal.data.users.map(x => ({
                id: x.id,
                label: x.fullName
              }))}
              onChange={value => alert(value)}
            />}
          />
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection></AppBarSection>
            <AppBarSection><Button type="primary">Start Impersonating</Button></AppBarSection>
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
              onClickImpersonate={onStartImpersonate}
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
    settings: (
      state.user &&
      state.user.data &&
      state.user.data.organization &&
      state.user.data.organization.settings
    ) || {}
  };
}, (dispatch: any) => {
  return {
    onStartImpersonate() {
      accounts.organizations.list().then(results => {
        dispatch(showModal('MODAL_IMPERSONATE', {
          organizations: results.map(objectSnakeToCamel),
          selectedOrganization: null,
          users: [],
          selectedUser: null,
        }));
      });
    },
    onCancelImpersonate() {
      dispatch(hideModal());
    },
    onSelectImpersonateOrganization(org) {
      accounts.users.list().then(results => {
        dispatch(updateModal('selectedOrganization', org.id));
        dispatch(updateModal('users', results.map(objectSnakeToCamel)));
      });
    }
  };
})(App);
