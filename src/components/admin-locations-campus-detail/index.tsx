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
} from '@density/ui/src';

import {
  AdminLocationsLeftPaneDataRow,
  AdminLocationsDetailSensorsTotal,
  AdminLocationsDetailRoomsTotal,
  AdminLocationsDetailLevelsTotal,
  AdminLocationsDetailBuildingsTotal,
  AdminLocationsListInfo,
  AdminLocationsListRoomsTotal,
  AdminLocationsListSize,
  AdminLocationsListTargetCapacity,
  AdminLocationsListCapacity,
  AdminLocationsListSensorsTotal,
  AdminLocationsListRightArrow,
  AdminLocationsListLevelsTotal,
  AdminLocationsListAnnualRent,
  AdminLocationsDoorwayList,
  AdminLocationsOperatingHours,
  AdminLocationsLeftPane,
} from '../admin-locations-snippets';
import { UserState } from '../../rx-stores/user';
import { SpacesLegacyState } from '../../rx-stores/spaces-legacy';
import { SpaceManagementState } from '../../rx-stores/space-management';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

export default function AdminLocationsCampusDetail({
  user,
  spaces,
  selectedSpace,
  spaceManagement
}: {
  user: UserState,
  spaces: SpacesLegacyState,
  selectedSpace: CoreSpace | undefined,
  spaceManagement: SpaceManagementState,
}) {
  if (!selectedSpace) { return null; }

  const visibleSpaces = spaces.data.filter(s => s.parent_id === (selectedSpace ? selectedSpace.id : null));
  const mapShown = selectedSpace.latitude !== null && selectedSpace.longitude !== null;

  return (
    <AppFrame>
      <AppSidebar visible width={550}>
        <AppBar>
          <AppBarTitle><div className={styles.title}>{selectedSpace.name}</div></AppBarTitle>
          <AppBarSection>
            <Button href={`#/spaces/${selectedSpace.id}`}>Explore</Button>
            <div style={{width: 8}}></div>
            {user.data && user.data.permissions?.includes('core_write') ? (
              <Button href={`#/admin/locations/${selectedSpace.id}/edit`}>Edit</Button>
            ) : null}
          </AppBarSection>
        </AppBar>
        <AdminLocationsLeftPane>
          {mapShown ? (
            <div className={styles.leftPaneMap}>
              <AdminLocationsSpaceMap
                readonly={true}
                space_type={selectedSpace.space_type}
                address={selectedSpace.address || ''}
                coordinates={(selectedSpace.latitude && selectedSpace.longitude) ? [selectedSpace.latitude, selectedSpace.longitude] : null}
              />
            </div>
          ) : null}
          <AdminLocationsLeftPaneDataRow includeTopBorder={mapShown}>
            <AdminLocationsDetailBuildingsTotal spaces={spaces} space={selectedSpace} />
            <AdminLocationsDetailLevelsTotal spaces={spaces} space={selectedSpace} />
            <AdminLocationsDetailRoomsTotal spaces={spaces} space={selectedSpace} />
            <AdminLocationsDetailSensorsTotal space={selectedSpace} />
          </AdminLocationsLeftPaneDataRow>
          <AdminLocationsOperatingHours space={selectedSpace} />
          <AdminLocationsDoorwayList space={selectedSpace} doorways={spaceManagement.doorways} />
        </AdminLocationsLeftPane>
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
                <AdminLocationsListSensorsTotal />
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
