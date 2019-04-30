import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';
import convertUnit, { UNIT_NAMES, SQUARE_FEET, SQUARE_METERS } from '../../helpers/convert-unit/index';

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

export default function AdminLocationsFloorDetail({ user, spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === selectedSpace.id);

  const sizeAreaConverted = selectedSpace.sizeArea && selectedSpace.sizeAreaUnit ? convertUnit(
    selectedSpace.sizeArea,
    selectedSpace.sizeAreaUnit,
    user.data.sizeAreaDisplayUnit,
  ) : null;

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
          <AdminLocationsLeftPaneDataRowItem
            id="size"
            label={`Size (${UNIT_NAMES[user.data.sizeAreaDisplayUnit]}):`}
            value={sizeAreaConverted ? sizeAreaConverted : <Fragment>&mdash;</Fragment>}
          />
          <AdminLocationsLeftPaneDataRowItem
            id="target-capacity"
            label="Target Capacity:"
            value={selectedSpace.targetCapacity ? selectedSpace.targetCapacity : <Fragment>&mdash;</Fragment>}
          />
          <AdminLocationsLeftPaneDataRowItem
            id="capacity"
            label="Capacity:"
            value={selectedSpace.capacity ? selectedSpace.capacity : <Fragment>&mdash;</Fragment>}
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
            value={selectedSpace.dpusTotal ? selectedSpace.dpusTotal : <Fragment>&mdash;</Fragment>}
          />
        </AdminLocationsLeftPaneDataRow>
      </AppSidebar>
      <AppPane>
        {visibleSpaces.length > 0 ? (
          <div className={styles.scroll}>
            <AdminLocationsSubheader
              title="Rooms"
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
                  title="Rooms"
                  template={item => spaces.data.filter(space => space.spaceType === 'space' && space.ancestry.map(a => a.id).includes(item.id)).length}
                  href={item => `#/admin/locations/${item.id}`}
                />
                <ListViewColumn
                  title={`Size (${UNIT_NAMES[user.data.sizeAreaDisplayUnit]})`}
                  template={item => item.sizeArea && item.sizeAreaUnit ? convertUnit(
                    item.sizeArea,
                    item.sizeAreaUnit,
                    user.data.sizeAreaDisplayUnit,
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
                  template={item => item.dpusTotal ? item.dpusTotal : <Fragment>&mdash;</Fragment>}
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
          <AdminLocationsDetailEmptyState text="You haven't added any rooms to this level yet."/>
        )}
      </AppPane>
    </AppFrame>
  );
}
