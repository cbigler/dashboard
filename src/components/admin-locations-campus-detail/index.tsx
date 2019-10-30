import React from 'react';
import styles from './styles.module.scss';
import AdminLocationsSubheader  from '../admin-locations-subheader/index';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';

import AdminLocationsSpaceMap from '../admin-locations-space-map/index';

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
  AdminLocationsDetailDPUsTotal,
  AdminLocationsDetailRoomsTotal,
  AdminLocationsDetailLevelsTotal,
  AdminLocationsDetailBuildingsTotal,
  AdminLocationsListInfo,
  AdminLocationsListRoomsTotal,
  AdminLocationsListSize,
  AdminLocationsListTargetCapacity,
  AdminLocationsListCapacity,
  AdminLocationsListDPUsTotal,
  AdminLocationsListRightArrow,
  AdminLocationsListLevelsTotal,
  AdminLocationsListAnnualRent,
  AdminLocationsDoorwayList,
  AdminLocationsOperatingHours,
} from '../admin-locations-snippets';

export default function AdminLocationsCampusDetail({ user, spaces, selectedSpace, spaceManagement }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === (selectedSpace ? selectedSpace.id : null));
  const mapShown = selectedSpace.latitude !== null && selectedSpace.longitude !== null;

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
          {mapShown ? (
            <div className={styles.leftPaneMap}>
              <AdminLocationsSpaceMap
                readonly={true}
                spaceType={selectedSpace.spaceType}
                address={selectedSpace.address}
                coordinates={[selectedSpace.latitude, selectedSpace.longitude]}
              />
            </div>
          ) : null}
          <AdminLocationsLeftPaneDataRow includeTopBorder={mapShown}>
            <AdminLocationsDetailBuildingsTotal spaces={spaces} space={selectedSpace} />
            <AdminLocationsDetailLevelsTotal spaces={spaces} space={selectedSpace} />
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
            <AdminLocationsSubheader title="Buildings" supportsHover={false} />
            <div className={styles.wrapper}>
              <ListView
                data={visibleSpaces}
                onClickRow={item => window.location.href = `#/admin/locations/${item.id}`}
              >
                <AdminLocationsListInfo />
                <AdminLocationsListLevelsTotal spaces={spaces} />
                <AdminLocationsListRoomsTotal spaces={spaces} />
                <AdminLocationsListSize user={user} />
                <AdminLocationsListAnnualRent />
                <AdminLocationsListTargetCapacity />
                <AdminLocationsListCapacity />
                <AdminLocationsListDPUsTotal />
                <AdminLocationsListRightArrow />
              </ListView>
            </div>
          </div>
        ) : (
          <AdminLocationsDetailEmptyState />
        )}
      </AppPane>
    </AppFrame>
  );
}
