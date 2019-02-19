import React from 'react';

import stringToBoolean from '../../helpers/string-to-boolean/index';

import { connect } from 'react-redux';

import TokenList from '../dev-token-list/index';
import Explore from '../explore/index';
import Login from '../login/index';
import Account from '../account/index';
import WebhookList from '../dev-webhook-list/index';
import AccountRegistration from '../account-registration/index';
import AccountForgotPassword from '../account-forgot-password/index';
import LiveSpaceList from '../live-space-list/index';
import LiveSpaceDetail from '../live-space-detail/index';
import DashboardsList from '../dashboards-list/index';
import SensorsList from '../sensors-list/index';

import AccountSetupOverview from '../account-setup-overview/index';
import AccountSetupDoorwayList from '../account-setup-doorway-list/index';
import AccountSetupDoorwayDetail from '../account-setup-doorway-detail/index';

import Dashboard from '../dashboard/index';
import AppNavbar from '../app-navbar/index';

import UnknownPage from '../unknown-page/index';

function App({activePage, settings}) {
  return (
    <div className="app">
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
              settings={settings}
            />;
        }
      })(activePage)}

      {/* Insert the currently displayed page into the view */}
      <ActivePage
        activePage={activePage}
        settings={settings}
      />
    </div>
  );
}

function ActivePage({activePage, settings}) {
  switch (activePage) {
  case "LOGIN":
    return <Login />;
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
  case "SENSORS_LIST":
    return <SensorsList />;
  case "ACCOUNT":
    return <Account />;
  case "DEV_WEBHOOK_LIST":
    return <WebhookList />;
  case "DEV_TOKEN_LIST":
    return <TokenList />;
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
    settings: (
      state.user &&
      state.user.data &&
      state.user.data.organization &&
      state.user.data.organization.settings
    ) || {}
  };
})(App);
