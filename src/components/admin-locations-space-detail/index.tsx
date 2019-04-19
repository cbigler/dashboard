import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';

import { getAreaUnit } from '../admin-locations-detail-modules/index';

import {
  AdminLocationsLeftPaneDataRow,
  AdminLocationsLeftPaneDataRowItem,
} from '../admin-locations-left-pane-data-row/index';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  AppFrame,
  AppPane,
  AppSidebar,
  Button,
  Icons,
} from '@density/ui';

export default function AdminLocationsSpaceDetail({ spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === selectedSpace.id);
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <AppBar>
          <AppBarTitle>{selectedSpace.name}</AppBarTitle>
          <AppBarSection>
            <Button onClick={() => {
              window.location.href = `#/admin/locations/${selectedSpace.id}/edit`;
            }}>Edit</Button>
          </AppBarSection>
        </AppBar>
        <AdminLocationsLeftPaneDataRow includeTopBorder={false}>
          <AdminLocationsLeftPaneDataRowItem
            id="capacity"
            label="Capacity:"
            value={"A"}
          />
          <AdminLocationsLeftPaneDataRowItem
            id="target-capacity"
            label="Target Capacity:"
            value={"R"}
          />
          <AdminLocationsLeftPaneDataRowItem
            id="spaces"
            label="Subspaces:"
            value={
              spaces.data
              .filter(space =>
                space.spaceType === 'space' &&
                space.ancestry.map(a => a.id).includes(selectedSpace.id)
              ).length
            }
          />
          <AdminLocationsLeftPaneDataRowItem
            id="dpus"
            label="DPUs:"
            value={"C"}
          />
        </AdminLocationsLeftPaneDataRow>
      </div>
    </div>
  );
}
