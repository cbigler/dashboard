import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';
import convertUnit, { UNIT_NAMES, SQUARE_FEET, SQUARE_METERS } from '../../helpers/convert-unit/index';

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

export default function AdminLocationsSpaceDetail({ user, spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === selectedSpace.id);

  // XXX TODO Remove this
  selectedSpace.sizeArea = 200;
  selectedSpace.sizeAreaUnit = SQUARE_FEET;
  selectedSpace.annualRent = 20000
  // XXX TODO Remove this

  const sizeAreaConverted = selectedSpace.sizeArea ? convertUnit(
    selectedSpace.sizeArea,
    selectedSpace.sizeAreaUnit,
    user.data.sizeAreaUnitDefault,
  ) : null;

  const leftPaneDataItemContents = (
    <Fragment>
      <AdminLocationsLeftPaneDataRowItem
        id="size"
        label={`Size (${UNIT_NAMES[user.data.sizeAreaUnitDefault]}):`}
        value={sizeAreaConverted}
      />
      <AdminLocationsLeftPaneDataRowItem
        id="capacity"
        label="Capacity:"
        value={selectedSpace.capacity ? selectedSpace.capacity : <Fragment>&mdash;</Fragment>}
      />
      <AdminLocationsLeftPaneDataRowItem
        id="target-capacity"
        label="Target Capacity:"
        value={selectedSpace.targetCapacity ? selectedSpace.targetCapacity : <Fragment>&mdash;</Fragment>}
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
        value={"HARDCODED"}
      />
    </Fragment>
  );

  // If a space has a space as its parent, it's nested as depely as it possibly can be.
  const parentSpace = spaces.data.find(space => space.id === selectedSpace.parentId);
  if (parentSpace.spaceType === 'space') {
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
        <AppSidebar visible width={550}>
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
          {visibleSpaces.length > 0 ? (
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
                    title={`Size (${UNIT_NAMES[user.data.sizeAreaUnitDefault]})`}
                    template={item => item.sizeArea && item.sizeAreaUnit ? convertUnit(
                      item.sizeArea,
                      item.sizeAreaUnit,
                      user.data.sizeAreaUnitDefault,
                    ) : <Fragment>&mdash;</Fragment>}
                    href={item => `#/admin/locations/${item.id}`}
                  />
                  <ListViewColumn
                    title="Target Capacity"
                    template={item => item.targetCapacity ? item.targetCapacity : <Fragment>&mdash;</Fragment>}
                    href={item => `#/admin/locations/${item.id}`}
                  />
                  <ListViewColumn
                    title="Capacity"
                    template={item => item.capacity ? item.capacity : <Fragment>&mdash;</Fragment>}
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
            ) : (
              <AdminLocationsDetailEmptyState />
            )}
        </AppPane>
      </AppFrame>
    );
  }
}
