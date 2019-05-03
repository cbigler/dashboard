import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import AdminLocationsSubheader  from '../admin-locations-subheader/index';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';

import AdminLocationsSpaceMap from '../admin-locations-space-map/index';
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

export default function AdminLocationsCampusDetail({ user, spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === (selectedSpace ? selectedSpace.id : null));
  const mapShown = selectedSpace.latitude !== null && selectedSpace.longitude !== null;

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
          <AdminLocationsLeftPaneDataRowItem
            id="buildings"
            label="Buildings:"
            value={
              spaces.data
              .filter(space =>
                space.spaceType === 'buildings' &&
                space.ancestry.map(a => a.id).includes(selectedSpace.id)
              ).length
            }
          />
          <AdminLocationsLeftPaneDataRowItem
            id="levels"
            label="Levels:"
            value={
              spaces.data
              .filter(space =>
                space.spaceType === 'floor' &&
                space.ancestry.map(a => a.id).includes(selectedSpace.id)
              ).length
            }
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
      </AppSidebar>
      <AppPane>
        {visibleSpaces.length > 0 ? (
          <div className={styles.scroll}>
            <AdminLocationsSubheader title="Buildings" supportsHover={false} />
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
                  title="Levels"
                  template={item => spaces.data.filter(space => space.spaceType === 'floor' && space.ancestry.map(a => a.id).includes(item.id)).length}
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
                  title="Annual Rent"
                  template={item => item.annualRent ? `$${item.annualRent}` : <Fragment>&mdash;</Fragment>}
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
                  template={item => item.sensorsTotal ? item.sensorsTotal : <Fragment>&mdash;</Fragment>}
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
