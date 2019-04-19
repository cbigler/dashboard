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

  const leftPaneDataItemContents = (
    <Fragment>
      <AdminLocationsLeftPaneDataRowItem
        id="size"
        label={`Size (${getAreaUnit(selectedSpace.sizeUnit)}):`}
        value={"H"}
      />
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
        label="Spaces:"
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
    </Fragment>
  );

  if (visibleSpaces.length === 0) {
    // Shown for spaces that are "leaves" in the hierarchy tree
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
            {leftPaneDataItemContents}
          </AdminLocationsLeftPaneDataRow>
        </div>
      </div>
    );
  } else {
    // Shown for spaces that have children of their own
    return (
      <AppFrame>
        <AppSidebar visible>
          <AppBar>
            <AppBarTitle>{selectedSpace.name}</AppBarTitle>
            <AppBarSection>
              <Button onClick={() => {
                window.location.href = `#/admin/locations/${selectedSpace.id}/edit`;
              }}>Edit</Button>
            </AppBarSection>
          </AppBar>
          <AdminLocationsLeftPaneDataRow includeTopBorder={false}>
            {leftPaneDataItemContents}
          </AdminLocationsLeftPaneDataRow>
        </AppSidebar>
        <AppPane>
          <div className={styles.scroll}>
            <AdminLocationsSubheader
              title="Spaces"
              supportsHover={false}
            />

            <div className={styles.wrapper}>
              <ListView data={visibleSpaces}>
                <ListViewColumn
                  title="Info"
                  template={item => (
                    <Fragment>
                      <AdminLocationsListViewImage space={item} />
                      <span className={styles.name}>{item.name}</span>
                    </Fragment>
                  )}
                  flexGrow={1}
                  href={item => `#/admin/locations/${item.id}`}
                />
                <ListViewColumn
                  title="Size (sq ft)"
                  template={item => 'HARDCODED'}
                  href={item => `#/admin/locations/${item.id}`}
                />
                <ListViewColumn
                  title="Seats"
                  template={item => 'HARDCODED'}
                  href={item => `#/admin/locations/${item.id}`}
                />
                <ListViewColumn
                  title="Capacity"
                  template={item => item.capacity === null ? <Fragment>&mdash;</Fragment> : item.capacity}
                  href={item => `#/admin/locations/${item.id}`}
                />
                <ListViewColumn
                  title="DPUs"
                  template={item => 'HARDCODED'}
                  href={item => `#/admin/locations/${item.id}`}
                />
                <ListViewColumn
                  title=""
                  template={item => <Icons.ArrowRight />}
                  href={item => `#/admin/locations/${item.id}`}
                />
              </ListView>
            </div>
          </div>
        </AppPane>
      </AppFrame>
    );
  }
}
