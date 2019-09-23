import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';
import convertUnit, { UNIT_NAMES } from '../../helpers/convert-unit/index';

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
  ListView,
  ListViewColumn,
} from '@density/ui';

export default function AdminLocationsSpaceDetail({ user, spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === selectedSpace.id);

  const sizeAreaConverted = selectedSpace.sizeArea && selectedSpace.sizeAreaUnit ? convertUnit(
    selectedSpace.sizeArea,
    selectedSpace.sizeAreaUnit,
    user.data.sizeAreaDisplayUnit,
  ) : null;

  const leftPaneDataItemContents = (
    <Fragment>
      <AdminLocationsLeftPaneDataRowItem
        id="size"
        label={`Size (${UNIT_NAMES[user.data.sizeAreaDisplayUnit]}):`}
        value={sizeAreaConverted ? sizeAreaConverted : <Fragment>&mdash;</Fragment>}
      />
      <AdminLocationsLeftPaneDataRowItem
        id="capacity"
        label="Capacity:"
        value={selectedSpace.capacity ? selectedSpace.capacity : <Fragment>&mdash;</Fragment>}
      />
      <AdminLocationsLeftPaneDataRowItem
        id="target-capacity"
        label="Target capacity:"
        value={selectedSpace.targetCapacity ? selectedSpace.targetCapacity : <Fragment>&mdash;</Fragment>}
      />
      <AdminLocationsLeftPaneDataRowItem
        id="spaces"
        label="Rooms:"
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
        value={selectedSpace.sensorsTotal ? selectedSpace.sensorsTotal : <Fragment>&mdash;</Fragment>}
      />
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
            <AppBarTitle>{selectedSpace.name}</AppBarTitle>
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
                  <ListViewColumn
                    id="Info"
                    width={320}
                    template={item => (
                      <Fragment>
                        <AdminLocationsListViewImage space={item} />
                        <span className={styles.name}>{item.name}</span>
                      </Fragment>
                    )}
                  />
                  <ListViewColumn
                    id={`Size (${UNIT_NAMES[user.data.sizeAreaDisplayUnit]})`}
                    width={120}
                    template={item => item.sizeArea && item.sizeAreaUnit ? convertUnit(
                      item.sizeArea,
                      item.sizeAreaUnit,
                      user.data.sizeAreaDisplayUnit,
                    ) : <Fragment>&mdash;</Fragment>}
                  />
                  <ListViewColumn
                    id="Target capacity"
                    width={120}
                    template={item => item.targetCapacity ? item.targetCapacity : <Fragment>&mdash;</Fragment>}
                  />
                  <ListViewColumn
                    id="Capacity"
                    width={100}
                    template={item => item.capacity ? item.capacity : <Fragment>&mdash;</Fragment>}
                  />
                  <ListViewColumn
                    id="DPUs"
                    width={80}
                    template={item => item.sensorsTotal ? item.sensorsTotal : <Fragment>&mdash;</Fragment>}
                  />
                  <ListViewColumn
                    width={60}
                    align="right"
                    template={item => <span style={{paddingRight: 24}}>
                      <Icons.ArrowRight width={17} height={17} />
                    </span>}
                  />
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
