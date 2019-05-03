import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import AdminLocationsDetailEmptyState from '../admin-locations-detail-empty-state/index';
import colorVariables from '@density/ui/variables/colors.json';
import convertUnit, { UNIT_NAMES, SQUARE_FEET, SQUARE_METERS } from '../../helpers/convert-unit/index';

import AdminLocationsSpaceMap from '../admin-locations-space-map/index';
import {
  AdminLocationsLeftPaneDataRow,
  AdminLocationsLeftPaneDataRowItem,
} from '../admin-locations-left-pane-data-row/index';

import {
  AppFrame,
  AppPane,
  AppSidebar,
  AppBar,
  AppBarSection,
  AppBarTitle,
  Button,
  Icons,
} from '@density/ui';

function SpaceList({ user, spaces, renderedSpaces }) {
  return (
    <div className={styles.spaceList}>
      <ListView data={renderedSpaces}>
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
  );
}

export default function AdminLocationsBuildingDetail({ user, spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === selectedSpace.id);
  const floors = visibleSpaces.filter(space => space.spaceType === 'floor');
  const spacesInEachFloor = floors.map(floor => spaces.data.filter(space => space.parentId === floor.id));
  const spacesNotInFloor = visibleSpaces.filter(space => space.spaceType === 'space');

  const sizeAreaConverted = selectedSpace.sizeArea && selectedSpace.sizeAreaUnit ? convertUnit(
    selectedSpace.sizeArea,
    selectedSpace.sizeAreaUnit,
    user.data.sizeAreaDisplayUnit,
  ) : null;

  const mapShown = selectedSpace.latitude !== null && selectedSpace.longitude !== null;

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
            id="size"
            label={`Size (${UNIT_NAMES[user.data.sizeAreaDisplayUnit]}):`}
            value={sizeAreaConverted ? sizeAreaConverted : <Fragment>&mdash;</Fragment>}
          />
          <AdminLocationsLeftPaneDataRowItem
            id="rent"
            label={`Annual Rent (per ${UNIT_NAMES[user.data.sizeAreaDisplayUnit]}):`}
            value={sizeAreaConverted && selectedSpace.annualRent ? (
              `$${(Math.round(selectedSpace.annualRent / sizeAreaConverted * 2) / 2).toFixed(2)}`
            ) : <Fragment>&mdash;</Fragment>}
          />
        </AdminLocationsLeftPaneDataRow>
        <AdminLocationsLeftPaneDataRow>
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
            value={selectedSpace.sensorsTotal}
          />
        </AdminLocationsLeftPaneDataRow>
      </AppSidebar>
      <AppPane>
        {visibleSpaces.length > 0 ? (
          <div className={styles.scroll}>
            {spacesNotInFloor.length > 0 ? (
              <Fragment>
                <AdminLocationsSubheader title="Rooms" supportsHover={false} />
                <SpaceList user={user} renderedSpaces={spacesNotInFloor} spaces={spaces} />
              </Fragment>
            ) : null}

            {floors.map((floor, index) => {
              return (
                <div key={floor.id} className={styles.section}>
                  <AdminLocationsSubheader title={floor.name} spaceId={floor.id} />
                  <SpaceList user={user} spaces={spaces} renderedSpaces={spacesInEachFloor[index]} />
                </div>
              );
            })}
          </div>
        ) : (
          <AdminLocationsDetailEmptyState text="You haven't added any floors or spaces to this building yet." />
        )}
      </AppPane>
    </AppFrame>
  );
}
