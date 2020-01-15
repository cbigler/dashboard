import styles from './styles.module.scss';

import React from 'react';

import accounts from '../../client/accounts';

import stringToBoolean from '../../helpers/string-to-boolean';

import Spaces from '../spaces/index';
import Login from '../login/index';
import Admin from '../admin/index';
import AdminUserManagementDetail from '../admin-user-management-detail/index';
import AdminLocationsEdit from '../admin-locations-edit/index';
import AdminLocationsNew from '../admin-locations-new/index';
import Account from '../account/index';
import AccountRegistration from '../account-registration/index';
import AccountForgotPassword from '../account-forgot-password/index';
import LiveSpaceList from '../live-space-list/index';
import LiveSpaceDetail from '../live-space-detail/index';
import DashboardsList from '../dashboards-list/index';
import DashboardsEdit from '../dashboard-edit/index';
import Analytics from '../analytics';
import Dialogger from '../dialogger';
import Toaster from '../toaster';

import showModal from '../../rx-actions/modal/show';
import updateModal from '../../rx-actions/modal/update';
import impersonateSet from '../../rx-actions/impersonate';
import { defaultState as impersonateDefaultState } from '../../rx-stores/impersonate';

import Dashboard from '../dashboard';
import AppNavbar from '../app-navbar';
import UnknownPage from '../unknown-page';
import ImpersonateModal from '../impersonate-modal';
import useRxStore from '../../helpers/use-rx-store';
import ImpersonateStore from '../../rx-stores/impersonate';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import UserStore, { UserState } from '../../rx-stores/user';
import ActiveModalStore, { ActiveModalState } from '../../rx-stores/active-modal';
import ActivePageStore, { ActivePageState } from '../../rx-stores/active-page';
import { getUserOrgSettings } from '../../helpers/legacy';
import { ImpersonateState } from '../../types/impersonate';
import { CoreUser } from '@density/lib-api-types/core-v2/users';

const App: React.FunctionComponent<{
  activePage: ActivePageState,
  activeModal: ActiveModalState,
  impersonate: ImpersonateState,
  user: UserState,
  settings: CoreUser['organization']['settings']
}> = function App({
  activePage,
  activeModal,
  impersonate,
  user,
  settings,
}) {
  const dispatch = useRxDispatch();

  return (
    <div className={styles.app}>
      {/* Impersonation modal */}
      {activeModal.name === 'MODAL_IMPERSONATE' ? <ImpersonateModal /> : null}

      {/* Show dialogs and toasts */}
      <Dialogger />
      <Toaster />

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
              onClickImpersonate={async () => {
                const value = impersonate || impersonateDefaultState;
                showModal(dispatch, 'MODAL_IMPERSONATE', {
                  ...value,
                  organizationFilter: '',
                  userFilter: '',
                  enabled: true
                });
          
                let organizations;
                if (value.enabled) {
                  organizations = value.organizations;
                } else {
                  organizations = (await accounts().get('/organizations')).data;
                  dispatch(impersonateSet({...value, organizations}));
                }
          
                updateModal(dispatch, {organizations, loading: false});
              }}
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
  case "ADMIN_SPACE_MAPPINGS":
  case "ADMIN_BRIVO_MAPPINGS":
  case "ADMIN_DEVICE_STATUS":
  case "ADMIN_LOCATIONS":
    return <Admin user={user} activePage={activePage} />;
  case "ADMIN_LOCATIONS_EDIT":
    return <AdminLocationsEdit />;
  case "ADMIN_LOCATIONS_NEW":
    return <AdminLocationsNew />;
  case "ADMIN_USER_MANAGEMENT_DETAIL":
    return <AdminUserManagementDetail />;
  case "LIVE_SPACE_LIST":
    return stringToBoolean(settings.insights_page_locked) ? null : <LiveSpaceList />;
  case "LIVE_SPACE_DETAIL":
    return <LiveSpaceDetail />;
  case "SPACES":
    return <Spaces />;
  case "SPACES_SPACE_TRENDS":
  case "SPACES_SPACE_DAILY":
  case "SPACES_SPACE_DATA_EXPORT":
  case "SPACES_SPACE_MEETINGS":
    return stringToBoolean(settings.insights_page_locked) ? null : <Spaces />;
  case "ACCOUNT":
    return <Account />;
  case "ACCOUNT_REGISTRATION":
    return <AccountRegistration />;
  case "ACCOUNT_FORGOT_PASSWORD":
    return <AccountForgotPassword />;
  case "DASHBOARD_LIST":
    return <DashboardsList />;
  case "DASHBOARD_DETAIL":
    return <Dashboard />;
  case "DASHBOARD_EDIT":
    return <DashboardsEdit />;
  case "ANALYTICS":
    return <Analytics />;

  // When logging out, navigate to this page (it's empty) to ensure that removing things like the
  // token doesn't cause weird stuff in components that expect it to exist.
  case "BLANK":
  case "LOGOUT":
    return null;

  default:
    return <UnknownPage invalidUrl={activePage} />;
  }
}


const ConnectedApp: React.FC = () => {
  const user = useRxStore(UserStore);
  const activePage = useRxStore(ActivePageStore);
  const activeModal = useRxStore(ActiveModalStore);
  const impersonate = useRxStore(ImpersonateStore);

  const settings = getUserOrgSettings(user);
  return (
    <App
      user={user}
      activePage={activePage}
      activeModal={activeModal}
      impersonate={impersonate}
      settings={settings}
    />
  )
}

export default ConnectedApp;