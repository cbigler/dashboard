import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import colorVariables from '@density/ui/variables/colors.json';
import { getAreaUnit } from '../admin-locations-detail-modules/index';

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

function SpaceList({ spaces, renderedSpaces }) {
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
          title="Spaces"
          template={item => spaces.data.filter(space => space.spaceType === 'space' && space.ancestry.map(a => a.id).includes(item.id)).length}
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
          template={item => 'HARDCODED'}
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
  );
}

export default function AdminLocationsBuildingDetail({ spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === selectedSpace.id);
  const floors = visibleSpaces.filter(space => space.spaceType === 'floor');
  const spacesInEachFloor = floors.map(floor => spaces.data.filter(space => space.parentId === floor.id));
  const spacesNotInFloor = visibleSpaces.filter(space => space.spaceType === 'space');

  const mapShown = selectedSpace.latitude !== null && selectedSpace.longitude !== null;

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
        {mapShown ? (
          <div className={styles.leftPaneMap}>
            <AdminLocationsSpaceMap
              readonly={true}
              space={selectedSpace}
              address="HARDCODED"
              coordinates={[selectedSpace.latitude, selectedSpace.longitude]}
            />
          </div>
        ) : null}
        <AdminLocationsLeftPaneDataRow includeTopBorder={mapShown}>
          <AdminLocationsLeftPaneDataRowItem
            id="size"
            label={`Size (${getAreaUnit(selectedSpace.sizeUnit)}):`}
            value={"HARDCODED"}
          />
          <AdminLocationsLeftPaneDataRowItem
            id="size"
            label={`Rent (per ${getAreaUnit(selectedSpace.sizeUnit)}):`}
            value={"HARDCODED"}
          />
        </AdminLocationsLeftPaneDataRow>
        <AdminLocationsLeftPaneDataRow>
          <AdminLocationsLeftPaneDataRowItem
            id="target-capacity"
            label="Target Capacity:"
            value={"H"}
          />
          <AdminLocationsLeftPaneDataRowItem
            id="capacity"
            label="Capacity:"
            value={"A"}
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
        </AdminLocationsLeftPaneDataRow>
      </AppSidebar>
      <AppPane>
        <div className={styles.scroll}>
          {spacesNotInFloor.length > 0 ? (
            <Fragment>
              <AdminLocationsSubheader title="Rooms" supportsHover={false} />
              <SpaceList renderedSpaces={spacesNotInFloor} spaces={spaces} />
            </Fragment>
          ) : null}

          {floors.map((floor, index) => {
            return (
              <div key={floor.id} className={styles.section}>
                <AdminLocationsSubheader title={floor.name} spaceId={floor.id} />
                <SpaceList spaces={spaces} renderedSpaces={spacesInEachFloor[index]} />
              </div>
            );
          })}
        </div>
      </AppPane>
    </AppFrame>
  );
}
