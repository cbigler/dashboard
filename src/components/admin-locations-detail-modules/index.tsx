import styles from './styles.module.scss';

import React from 'react';
import classnames from 'classnames';


import {
  AppBar,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonContext,
} from '@density/ui';

import AdminLocationsDetailModulesAddressLocal from './address';
import AdminLocationsDetailModulesDangerZoneLocal from './danger-zone';
import AdminLocationsDetailModulesGeneralInfoLocal from './general-info';
import AdminLocationsDetailModulesMetadataLocal from './metadata';
import AdminLocationsDetailModulesOperatingHoursLocal from './operating-hours';

export const AdminLocationsDetailModulesAddress = AdminLocationsDetailModulesAddressLocal;
export const AdminLocationsDetailModulesDangerZone = AdminLocationsDetailModulesDangerZoneLocal;
export const AdminLocationsDetailModulesGeneralInfo = AdminLocationsDetailModulesGeneralInfoLocal;
export const AdminLocationsDetailModulesMetadata = AdminLocationsDetailModulesMetadataLocal;
export const AdminLocationsDetailModulesOperatingHours = AdminLocationsDetailModulesOperatingHoursLocal;

export default function AdminLocationsDetailModule({
  title,
  error=false,
  includePadding=true,
  actions=null,
  children,
}) {
  return (
    <div className={classnames(styles.module, {[styles.moduleError]: error})}>
      <div className={styles.moduleHeader}>
        <AppBarContext.Provider value="CARD_HEADER">
          <AppBar>
            <AppBarTitle>{title}</AppBarTitle>
            {actions}
          </AppBar>
        </AppBarContext.Provider>
      </div>
      <div className={classnames(styles.moduleBody, {[styles.padding]: includePadding})}>
        {children}
      </div>
    </div>
  );
}
