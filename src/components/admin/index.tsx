import React, { Fragment } from 'react';

import WebhookList from '../dev-webhook-list/index';
import TokenList from '../dev-token-list/index';
import SensorsList from '../sensors-list/index';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppFrame,
  AppPane,
} from '@density/ui';

import Toaster from '../toaster';
import AppBarSubnav, { AppBarSubnavLink } from '../app-bar-subnav';
import AdminUserManagement from '../admin-user-management';
import can from '../../helpers/permissions';
// import AdminDeveloper from '../admin-developer';
// import AdminDeviceStatus from '../admin-device-status';

export default function Admin({
  user,
  activePage
}) {
  return (
    <Fragment>
      <Toaster />
      <div style={{height: activePage === 'ADMIN_USER_MANAGEMENT' ? '100%' : undefined}}>
        <AppFrame>
          <AppPane>
            <AppBar>
              <AppBarSection>
                <AppBarTitle>Administration</AppBarTitle>
              </AppBarSection>
              <AppBarSection>
                <AppBarSubnav>
                  <AppBarSubnavLink
                    href="#/admin/user-management"
                    active={activePage === "ADMIN_USER_MANAGEMENT"}
                  >
                    User Management
                  </AppBarSubnavLink>
                  {can(user, 'developer_tools_manage') ? 
                    <AppBarSubnavLink
                      href="#/dev/tokens"
                      active={['DEV_WEBHOOK_LIST', 'DEV_TOKEN_LIST'].includes(activePage)}
                    >
                      Developer
                    </AppBarSubnavLink> : null}
                  {can(user, 'sensors_list') ? 
                    <AppBarSubnavLink
                      href="#/sensors"
                      active={activePage === "SENSORS_LIST"}
                    >
                      DPU Status
                    </AppBarSubnavLink> : null}
                </AppBarSubnav>
              </AppBarSection>
            </AppBar>
            {activePage === 'ADMIN_USER_MANAGEMENT' ? <AdminUserManagement /> : null}
            {/* {activePage === 'ADMIN_DEVELOPER' ? <AdminDeveloper /> : null}
            {activePage === 'ADMIN_DEVICE_STATUS' ? <AdminDeviceStatus /> : null} */}
          </AppPane>
        </AppFrame>
      </div>
      {/* TODO: replace these with new UI */}
      {activePage === 'DEV_WEBHOOK_LIST' ? <WebhookList /> : null}
      {activePage === 'DEV_TOKEN_LIST' ? <TokenList /> : null}
      {activePage === 'SENSORS_LIST' ? <SensorsList /> : null}
    </Fragment>
  );
}
