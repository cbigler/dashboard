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
            {user.data.permissions.includes('core_write') ? (
              <Button onClick={() => {
                window.location.href = `#/admin/locations/${selectedSpace.id}/edit`;
              }}>Edit</Button>
            ) : null}
          </AppBarSection>
        </AppBar>
        <div className={styles.sidebar}>
          <AdminLocationsLeftPaneDataRow includeTopBorder={false}>
            <AdminLocationsLeftPaneDataRowItem
              id="size"
              label={`Size (${UNIT_NAMES[user.data.sizeAreaDisplayUnit]}):`}
              value={sizeAreaConverted ? sizeAreaConverted : <Fragment>&mdash;</Fragment>}
            />
            <AdminLocationsLeftPaneDataRowItem
              id="target-capacity"
              label="Target capacity:"
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
              value={selectedSpace.sensorsTotal ? selectedSpace.sensorsTotal : <Fragment>&mdash;</Fragment>}
            />
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
                  id="Rooms"
                  width={80}
                  template={item => spaces.data.filter(space => space.spaceType === 'space' && space.ancestry.map(a => a.id).includes(item.id)).length}
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
                  template={item => <span style={{paddingRight: 24}}><Icons.ArrowRight /></span>}
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
