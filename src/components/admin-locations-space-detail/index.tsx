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
  AdminLocationsListRightArrow
} from '../admin-locations-snippets';

export default function AdminLocationsSpaceDetail({ user, spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === selectedSpace.id);

  const leftPaneDataItemContents = (
    <Fragment>
      <AdminLocationsDetailSizeArea user={user} space={selectedSpace} />
      <AdminLocationsDetailTargetCapacity space={selectedSpace} />
      <AdminLocationsDetailCapacity space={selectedSpace} />
      <AdminLocationsDetailRoomsTotal spaces={spaces} space={selectedSpace} />
      <AdminLocationsDetailDPUsTotal space={selectedSpace} />
    </Fragment>
  );

  // If a space has a space as its parent, it's nested as depely as it possibly can be.
  const parentSpace = spaces.data.find(space => space.id === selectedSpace.parentId);
  if (parentSpace && parentSpace.spaceType === 'space') {
    // Shown for spaces that are "leaves" in the hierarchy tree
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <AppBar>
            <AppBarTitle><div className={styles.title}>{selectedSpace.name}</div></AppBarTitle>
            <AppBarSection>
              {user.data.permissions.includes('core_write') ? (
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
              {user.data.permissions.includes('core_write') ? (
                <Button href={`#/admin/locations/${selectedSpace.id}/edit`}>Edit</Button>
              ) : null}
            </AppBarSection>
          </AppBar>
          <div className={styles.sidebar}>
            <AdminLocationsLeftPaneDataRow includeTopBorder={false}>
              {leftPaneDataItemContents}
            </AdminLocationsLeftPaneDataRow>
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
                  <AdminLocationsListSize user={user} />
                  <AdminLocationsListTargetCapacity />
                  <AdminLocationsListCapacity />
                  <AdminLocationsListDPUsTotal />
                  <AdminLocationsListRightArrow />
                </ListView>
              </div>
            </div>
            ) : (
              <AdminLocationsDetailEmptyState text="You haven't added any rooms inside this room yet."/>
            )}
        </AppPane>
      </AppFrame>
    );
  }
}
