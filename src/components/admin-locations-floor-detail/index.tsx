import React from 'react';
import styles from './styles.module.scss';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  AppFrame,
  AppPane,
  AppSidebar,
  Button,
  ListView,
} from '@density/ui';

import {
  AdminLocationsLeftPaneDataRow,
  AdminLocationsDetailSizeArea,
  AdminLocationsDetailTargetCapacity,
  AdminLocationsDetailCapacity,
  AdminLocationsDetailRoomsTotal,
  AdminLocationsDetailDPUsTotal,
  AdminLocationsListInfo,
  AdminLocationsListSize,
  AdminLocationsListTargetCapacity,
  AdminLocationsListCapacity,
  AdminLocationsListDPUsTotal,
  AdminLocationsListRightArrow,
  AdminLocationsListRoomsTotal,
  AdminLocationsDoorwayList,
  AdminLocationsOperatingHours,
} from '../admin-locations-snippets';

export default function AdminLocationsFloorDetail({ user, spaces, selectedSpace, spaceManagement }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === selectedSpace.id);

  return (
    <AppFrame>
      <AppSidebar visible width={550}>
        <AppBar>
          <AppBarTitle><div className={styles.title}>{selectedSpace.name}</div></AppBarTitle>
          <AppBarSection>
            {user.data.permissions.includes('core_write') ? (
              <Button href={`#/admin/locations/${selectedSpace.id}/edit`}>Edit</Button>
            ) : null}
          </AppBarSection>
        </AppBar>
        <div className={styles.sidebar}>
          <AdminLocationsLeftPaneDataRow includeTopBorder={false}>
            <AdminLocationsDetailSizeArea user={user} space={selectedSpace} />
            <AdminLocationsDetailTargetCapacity space={selectedSpace} />
            <AdminLocationsDetailCapacity space={selectedSpace} />
            <AdminLocationsDetailRoomsTotal spaces={spaces} space={selectedSpace} />
            <AdminLocationsDetailDPUsTotal space={selectedSpace} />
          </AdminLocationsLeftPaneDataRow>
          <AdminLocationsOperatingHours space={selectedSpace} />
          <AdminLocationsDoorwayList space={selectedSpace} doorways={spaceManagement.doorways} />
        </div>
      </AppSidebar>
      <AppPane>
        {visibleSpaces.length > 0 ? (
          <div className={styles.scroll}>
            <AdminLocationsSubheader
              title="Rooms"
              supportsHover={false}
            />

            <div className={styles.wrapper}>
              <ListView
                data={visibleSpaces}
                onClickRow={item => window.location.href = `#/admin/locations/${item.id}`}
              >
                <AdminLocationsListInfo />
                <AdminLocationsListRoomsTotal spaces={spaces} />
                <AdminLocationsListSize user={user} />
                <AdminLocationsListTargetCapacity />
                <AdminLocationsListCapacity />
                <AdminLocationsListDPUsTotal />
                <AdminLocationsListRightArrow />
              </ListView>
            </div>
          </div>
        ) : (
          <AdminLocationsDetailEmptyState text="You haven't added any rooms to this level yet."/>
        )}
      </AppPane>
    </AppFrame>
  );
}
