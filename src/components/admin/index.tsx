import React from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppFrame,
  AppPane,
} from '@density/ui/src';

import AppBarSubnav, { AppBarSubnavLink } from '../app-bar-subnav';
import AdminUserManagement from '../admin-user-management';
import can, { PERMISSION_CODES } from '../../helpers/permissions';
import AdminDeveloper from '../admin-developer';
import AdminDeviceStatus from '../admin-device-status';
import AdminIntegrations from '../admin-integrations';
import AdminLocations from '../admin-locations';
import AdminSpaceMappings from '../admin-space-mappings';
import AdminBrivoMappings from '../admin-brivo-mappings';


export default function Admin({
  user,
  activePage
}) {
  return (
    <AppFrame>
      <AppPane>
        <AppBar>
          <AppBarSection>
            <AppBarTitle>Administration</AppBarTitle>
          </AppBarSection>
          <AppBarSection>
            <AppBarSubnav>
              <AppBarSubnavLink
                href="#/admin/locations"
                active={activePage === 'ADMIN_LOCATIONS'}
              >
                Locations
              </AppBarSubnavLink>
              <AppBarSubnavLink
                href="#/admin/user-management"
                active={activePage === 'ADMIN_USER_MANAGEMENT'}
              >
                User Management
              </AppBarSubnavLink>
              {can(user, PERMISSION_CODES.developerToolsManage) ? 
                <AppBarSubnavLink
                  href="#/admin/integrations"
                  active={['ADMIN_INTEGRATIONS', 'ADMIN_SPACE_MAPPINGS', 'ADMIN_BRIVO_MAPPINGS'].includes(activePage)}
                >
                  Integrations
                </AppBarSubnavLink> : null}
              {can(user, PERMISSION_CODES.developerToolsManage) ? 
                <AppBarSubnavLink
                  href="#/admin/developer"
                  active={activePage === 'ADMIN_DEVELOPER'}
                >
                  Developer
                </AppBarSubnavLink> : null}
              {can(user, PERMISSION_CODES.sensorsList) ? 
                <AppBarSubnavLink
                  href="#/admin/device-status"
                  active={activePage === 'ADMIN_DEVICE_STATUS'}
                >
                  Sensor Status
                </AppBarSubnavLink> : null}
            </AppBarSubnav>
          </AppBarSection>
        </AppBar>
        {activePage === 'ADMIN_INTEGRATIONS' ? <AdminIntegrations /> : null}
        {activePage === 'ADMIN_SPACE_MAPPINGS' ? <AdminSpaceMappings /> : null}
        {activePage === 'ADMIN_BRIVO_MAPPINGS' ? <AdminBrivoMappings /> : null}
        {activePage === 'ADMIN_USER_MANAGEMENT' ? <AdminUserManagement /> : null}
        {activePage === 'ADMIN_DEVELOPER' ? <AdminDeveloper /> : null}
        {activePage === 'ADMIN_DEVICE_STATUS' ? <AdminDeviceStatus /> : null}
        {activePage === 'ADMIN_LOCATIONS' ? <AdminLocations /> : null}
      </AppPane>
    </AppFrame>
  );
}
