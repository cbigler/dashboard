import React, { ReactNode, Component, Fragment } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import uuid from 'uuid';

import FormLabel from '../form-label/index';
import TIME_ZONE_CHOICES from '../../helpers/time-zone-choices/index';
import generateResetTimeChoices from '../../helpers/generate-reset-time-choices/index';
import { UNIT_NAMES, SQUARE_FEET, SQUARE_METERS } from '../../helpers/convert-unit/index';

import styles from './styles.module.scss';

import {
  AppBar,
  AppBarTitle,
  AppBarContext,
} from '@density/ui';

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
