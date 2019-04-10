import styles from './styles.module.scss';

import React from 'react';
import { connect } from 'react-redux';

import accounts from '../../client/accounts';

import stringToBoolean from '../../helpers/string-to-boolean';

import Explore from '../explore/index';
import Login from '../login/index';
import Admin from '../admin/index';
import AdminUserManagementDetail from '../admin-user-management-detail/index';
import AdminLocations from '../admin-locations/index';
import AdminLocationsEdit from '../admin-locations-edit/index';
import Account from '../account/index';
import AccountRegistration from '../account-registration/index';
import AccountForgotPassword from '../account-forgot-password/index';
import LiveSpaceList from '../live-space-list/index';
import LiveSpaceDetail from '../live-space-detail/index';
import DashboardsList from '../dashboards-list/index';

import showModal from '../../actions/modal/show';
import updateModal from '../../actions/modal/update';
import impersonateSet from '../../actions/impersonate';
import { defaultState as impersonateDefaultState } from '../../reducers/impersonate';

import AccountSetupOverview from '../account-setup-overview';
import AccountSetupDoorwayList from '../account-setup-doorway-list';
import AccountSetupDoorwayDetail from '../account-setup-doorway-detail';

import Dashboard from '../dashboard';
import AppNavbar from '../app-navbar';
import UnknownPage from '../unknown-page';
import ImpersonateModal from '../impersonate-modal';

function App({
  activePage,
  activeModal,
  user,
  impersonate,
  settings,
  
  onShowImpersonate,
}) {
  return (
    <div className={styles.app}>
      {/* Impersonation modal */}
      {activeModal.name === 'MODAL_IMPERSONATE' ? <ImpersonateModal /> : null}

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
  case "ADMIN_INTEGRATIONS":
  case "ADMIN_DEVICE_STATUS":
  case "ADMIN_LOCATIONS":
    return <Admin user={user} activePage={activePage} />;
  case "ADMIN_LOCATIONS_EDIT":
    return <AdminLocationsEdit />;
  case "ADMIN_USER_MANAGEMENT_DETAIL":
    return <AdminUserManagementDetail />;
  case "LIVE_SPACE_LIST":
    return stringToBoolean(settings.insightsPageLocked) ? null : <LiveSpaceList />;
  case "LIVE_SPACE_DETAIL":
    return <LiveSpaceDetail />;
  case "EXPLORE":
    return <Explore activePage={activePage} />;
  case "EXPLORE_SPACE_TRENDS":
  case "EXPLORE_SPACE_DAILY":
  case "EXPLORE_SPACE_DATA_EXPORT":
  case "EXPLORE_SPACE_MEETINGS":
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
      impersonate = impersonate || impersonateDefaultState;
      dispatch(showModal('MODAL_IMPERSONATE', {
        ...impersonate,
        organizationFilter: '',
        userFilter: '',
        enabled: true
      }));

      let organizations;
      if (impersonate.enabled) {
        organizations = impersonate.organizations;
      } else {
        organizations = (await accounts().get('/organizations')).data;
        dispatch(impersonateSet({...impersonate, organizations}));
      }

      dispatch(updateModal({organizations, loading: false}));
    },
  };
})(App);
