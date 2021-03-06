import React, { Fragment } from 'react';
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
} from '@density/ui/src';

import {
  AdminLocationsLeftPaneDataRow,
  AdminLocationsDetailSizeArea,
  AdminLocationsDetailTargetCapacity,
  AdminLocationsDetailCapacity,
  AdminLocationsDetailRoomsTotal,
  AdminLocationsDetailSensorsTotal,
  AdminLocationsListInfo,
  AdminLocationsListSize,
  AdminLocationsListTargetCapacity,
  AdminLocationsListCapacity,
  AdminLocationsListSensorsTotal,
  AdminLocationsListRightArrow,
  AdminLocationsDoorwayList,
  AdminLocationsOperatingHours,
  AdminLocationsLeftPane,
} from '../admin-locations-snippets';
import { UserState } from '../../rx-stores/user';
import { SpacesLegacyState } from '../../rx-stores/spaces-legacy';
import { SpaceManagementState } from '../../rx-stores/space-management';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

export default function AdminLocationsSpaceDetail({
  user,
  spaces,
  selectedSpace,
  spaceManagement
}: {
  user: UserState,
  spaces: SpacesLegacyState,
  spaceManagement: SpaceManagementState,
  selectedSpace: CoreSpace | undefined
}) {
  if (!selectedSpace) { return null; }
  const visibleSpaces = spaces.data.filter(s => s.parent_id === selectedSpace.id);

  const leftPaneDataItemContents = (
    <Fragment>
      <AdminLocationsDetailSizeArea user={user} space={selectedSpace} />
      <AdminLocationsDetailTargetCapacity space={selectedSpace} />
      <AdminLocationsDetailCapacity space={selectedSpace} />
      <AdminLocationsDetailRoomsTotal spaces={spaces} space={selectedSpace} />
      <AdminLocationsDetailSensorsTotal space={selectedSpace} />
    </Fragment>
  );

  // If a space has a space as its parent, it's nested as depely as it possibly can be.
  const parentSpace = spaces.data.find(space => space.id === selectedSpace.parent_id);
  if (parentSpace && parentSpace.space_type === 'space') {
    // Shown for spaces that are "leaves" in the hierarchy tree
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
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
          <AdminLocationsLeftPaneDataRow includeTopBorder={false} includeBottomBorder={false}>
            {leftPaneDataItemContents}
          </AdminLocationsLeftPaneDataRow>
        </div>
      </div>
    );
  } else {
    // Shown for spaces that have children of their own
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
            <AdminLocationsLeftPaneDataRow includeTopBorder={false}>
              {leftPaneDataItemContents}
            </AdminLocationsLeftPaneDataRow>
            <AdminLocationsOperatingHours space={selectedSpace} />
            <AdminLocationsDoorwayList space={selectedSpace} doorways={spaceManagement.doorways} />
          </AdminLocationsLeftPane>
        </AppSidebar>
        <AppPane>
          {visibleSpaces.length > 0 ? (
            <div className={styles.scroll}>
              <AdminLocationsSubheader
                title="Spaces"
                supportsHover={false}
              />

              <div className={styles.wrapper}>
                <ListView
                  data={visibleSpaces}
                  onClickRow={item => window.location.href = `#/admin/locations/${item.id}`}
                >
                  <AdminLocationsListInfo />
                  <AdminLocationsListSize user={user} />
                  <AdminLocationsListTargetCapacity />
                  <AdminLocationsListCapacity />
                  <AdminLocationsListSensorsTotal />
                  <AdminLocationsListRightArrow />
                </ListView>
              </div>
            </div>
            ) : (
              <AdminLocationsDetailEmptyState heading="There are no spaces nested beneath this space." text="You can add some by clicking “Add a space” above."/>
            )}
        </AppPane>
      </AppFrame>
    );
  }
}
