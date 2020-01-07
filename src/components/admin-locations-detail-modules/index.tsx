import React, { ReactNode } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';

import {
  AppBar,
  AppBarTitle,
  AppBarContext,
} from '@density/ui/src';

import AdminLocationsDetailModulesAddressLocal from './address';
import AdminLocationsDetailModulesDangerZoneLocal from './danger-zone';
import AdminLocationsDetailModulesGeneralInfoLocal from './general-info';
import AdminLocationsDetailModulesMetadataLocal from './metadata';
import AdminLocationsDetailModulesDoorwaysLocal from './doorways';
import AdminLocationsDetailModulesOperatingHoursLocal from './operating-hours';
import AdminLocationsDetailModulesTagsLocal from './tags';

export const AdminLocationsDetailModulesAddress = AdminLocationsDetailModulesAddressLocal;
export const AdminLocationsDetailModulesDangerZone = AdminLocationsDetailModulesDangerZoneLocal;
export const AdminLocationsDetailModulesGeneralInfo = AdminLocationsDetailModulesGeneralInfoLocal;
export const AdminLocationsDetailModulesMetadata = AdminLocationsDetailModulesMetadataLocal;
export const AdminLocationsDetailModulesDoorways = AdminLocationsDetailModulesDoorwaysLocal;
export const AdminLocationsDetailModulesOperatingHours = AdminLocationsDetailModulesOperatingHoursLocal;
export const AdminLocationsDetailModulesTags = AdminLocationsDetailModulesTagsLocal;

export default function AdminLocationsDetailModule({
  title,
  error=false,
  includePadding=true,
  hideOverflow=false,
  actions=null as ReactNode | null,
  children,
}) {
  return (
    <div className={classnames(styles.module, {
      [styles.moduleHideOverflow]: hideOverflow,
      [styles.moduleError]: error
    })}>
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
