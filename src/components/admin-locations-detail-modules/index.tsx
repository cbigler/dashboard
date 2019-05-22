import React, { Fragment } from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';
import colorVariables from '@density/ui/variables/colors.json';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonContext,
  Icons,
  InputBox,
} from '@density/ui';

import ListView, { ListViewColumn } from '../list-view';
import Checkbox from '../checkbox';

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

function DoorwayList({doorways, shaded=false}) {
  return (
    <div className={classnames(styles.doorwayList, {[styles.shaded]: shaded})}>
      <ListView data={doorways}>
        <ListViewColumn
          title="Doorways"
          template={i => (
            <Fragment>
              <Checkbox checked={true} onChange={console.log} />
              <Icons.Doorway color={colorVariables.grayDarkest} />
              {i.name}
            </Fragment>
          )}
          flexGrow={1}
          flexShrink={1}
        />
        <ListViewColumn
          title="Linked Spaces"
          template={i => JSON.stringify(i.spaces)}
          flexGrow={1}
          flexShrink={1}
        />
        <ListViewColumn
          title="DPU Position"
          template={i => 'Inside'}
          width={215}
        />
        <ListViewColumn
          title={null}
          template={i => 'Edit'}
        />
      </ListView>
    </div>
  );
}

export function AdminLocationsDetailModulesDoorways({
}) {
  return (
    <AdminLocationsDetailModule title="Doorways" includePadding={false}>
      <AppBar>
        <AppBarSection>
          <InputBox
            leftIcon={<Icons.Search />}
            placeholder={'ex: "Doorway A", "Stairwell B"'}
            width={344}
          />
        </AppBarSection>
        <AppBarSection>
          <Button>
            Add a doorway
          </Button>
        </AppBarSection>
      </AppBar>
      <DoorwayList doorways={[{id: 1, name: 'foo'}]} />
      <DoorwayList doorways={[{id: 1, name: 'bar'}, {id: 2, name: 'baz'}, {id: 3, name: 'quux'}]} shaded />
    </AdminLocationsDetailModule>
  );
}
