import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import colorVariables from '@density/ui/variables/colors.json';

import AdminLocationsSpaceMap from '../admin-locations-space-map/index';

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
        {selectedSpace.latitude !== null && selectedSpace.longitude !== null ? (
          <AdminLocationsSpaceMap
            readonly={true}
            space={selectedSpace}
            address="WeWork Gramercy, 120 E 23rd St, New York City, New York 10010, United States of America"
            coordinates={[selectedSpace.latitude, selectedSpace.longitude]}
          />
        ) : null}
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
