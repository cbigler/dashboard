import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';

import AdminLocationsSpaceMap from '../admin-locations-space-map/index';

import {
  AppFrame,
  AppPane,
  AppSidebar,
  AppBar,
  AppBarSection,
  AppBarTitle,
  Button,
  ListView,
} from '@density/ui/src';

import {
  AdminLocationsDetailTargetCapacity,
  AdminLocationsDetailCapacity,
  AdminLocationsDetailLevelsTotal,
  AdminLocationsDetailRoomsTotal,
  AdminLocationsDetailDPUsTotal,
  AdminLocationsLeftPaneDataRow,
  AdminLocationsDetailSizeArea,
  AdminLocationsDetailAnnualRent,
  AdminLocationsListInfo,
  AdminLocationsListRoomsTotal,
  AdminLocationsListSize,
  AdminLocationsListTargetCapacity,
  AdminLocationsListCapacity,
  AdminLocationsListDPUsTotal,
  AdminLocationsListRightArrow,
  AdminLocationsDoorwayList,
  AdminLocationsOperatingHours,
  AdminLocationsLeftPane,
} from '../admin-locations-snippets';

function SpaceList({ user, spaces, renderedSpaces }) {
  return (
    <div className={styles.spaceList}>
      <ListView
        data={renderedSpaces}
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
  );
}

export default function AdminLocationsBuildingDetail({ user, spaces, selectedSpace, spaceManagement }) {
  const visibleSpaces = spaces.data.filter(s => s.parent_id === selectedSpace.id);
  const floors = visibleSpaces.filter(space => space.space_type === 'floor');
  const spacesInEachFloor = floors.map(floor => spaces.data.filter(space => space.parent_id === floor.id));
  const spacesNotInFloor = visibleSpaces.filter(space => space.space_type === 'space');
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
        <AdminLocationsLeftPane>
          {mapShown ? (
            <div className={styles.leftPaneMap}>
              <AdminLocationsSpaceMap
                readonly={true}
                space_type={selectedSpace.space_type}
                address={selectedSpace.address}
                coordinates={[selectedSpace.latitude, selectedSpace.longitude]}
              />
            </div>
          ) : null}
          <AdminLocationsLeftPaneDataRow includeTopBorder={mapShown}>
            <AdminLocationsDetailSizeArea user={user} space={selectedSpace} />
            <AdminLocationsDetailAnnualRent user={user} space={selectedSpace} />
          </AdminLocationsLeftPaneDataRow>
          <AdminLocationsLeftPaneDataRow>
            <AdminLocationsDetailTargetCapacity space={selectedSpace} />
            <AdminLocationsDetailCapacity space={selectedSpace} />
            <AdminLocationsDetailLevelsTotal spaces={spaces} space={selectedSpace} />
            <AdminLocationsDetailRoomsTotal spaces={spaces} space={selectedSpace} />
            <AdminLocationsDetailDPUsTotal space={selectedSpace} />
          </AdminLocationsLeftPaneDataRow>
          <AdminLocationsOperatingHours space={selectedSpace} />
          <AdminLocationsDoorwayList space={selectedSpace} doorways={spaceManagement.doorways} />
        </AdminLocationsLeftPane>
      </AppSidebar>
      <AppPane>
        {visibleSpaces.length > 0 ? (
          <div className={styles.scroll}>
            {spacesNotInFloor.length > 0 ? (
              <Fragment>
                <AdminLocationsSubheader title="Spaces" supportsHover={false} />
                <SpaceList user={user} renderedSpaces={spacesNotInFloor} spaces={spaces} />
              </Fragment>
            ) : null}

            {floors.map((floor, index) => {
              return (
                <div key={floor.id} className={styles.section}>
                  <AdminLocationsSubheader title={floor.name} space_id={floor.id} />
                  <SpaceList user={user} spaces={spaces} renderedSpaces={spacesInEachFloor[index]} />
                </div>
              );
            })}
          </div>
        ) : (
          <AdminLocationsDetailEmptyState heading="You haven't added any floors or spaces to this building yet." text="You can add some by clicking “Add a floor or “Add a space” above." />
        )}
      </AppPane>
    </AppFrame>
  );
}
