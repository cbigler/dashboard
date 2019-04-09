import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import colorVariables from '@density/ui/variables/colors.json';

import {
  AppFrame,
  AppPane,
  AppSidebar,
  AppBar,
  AppBarSection,
  Icons,
} from '@density/ui';

function AdminLocationsBuildingDetailSpaceList({ spaces }) {
  return (
    <div className={styles.spaceList}>
      <ListView data={spaces}>
        <ListViewColumn
          title="Info"
          template={item => (
            <Fragment>
              <AdminLocationsListViewImage space={item} />
              <span>{item.name}</span>
            </Fragment>
          )}
          flexGrow={1}
          href={item => `#/admin/locations/${item.id}`}
        />
        <ListViewColumn
          title="Spaces"
          template={item => '0'}
          href={item => `#/admin/locations/${item.id}`}
        />
        <ListViewColumn
          title="Size (sq ft)"
          template={item => '1200'}
          href={item => `#/admin/locations/${item.id}`}
        />
        <ListViewColumn
          title="Seats"
          template={item => '8'}
          href={item => `#/admin/locations/${item.id}`}
        />
        <ListViewColumn
          title="Capacity"
          template={item => '12'}
          href={item => `#/admin/locations/${item.id}`}
        />
        <ListViewColumn
          title="DPUs"
          template={item => '2'}
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
  const spacesNotInFloor = visibleSpaces.filter(space => floors.find(floor => space.parentId === floor.id));

  return (
    <AppFrame>
      <AppSidebar visible>
        TODO: Waiting on mockups
      </AppSidebar>
      <AppPane>
        {spacesNotInFloor.length > 0 ? (
          <Fragment>
            <AdminLocationsSubheader title="Rooms" supportsHover={false} />
            <AdminLocationsBuildingDetailSpaceList spaces={spacesNotInFloor} />
          </Fragment>
        ) : null}

        {floors.map((floor, index) => {
          return (
            <div key={floor.id} className={styles.section}>
              <AdminLocationsSubheader title={floor.name} spaceId={floor.id} />
              <AdminLocationsBuildingDetailSpaceList spaces={spacesInEachFloor[index]} />
            </div>
          );
        })}
      </AppPane>
    </AppFrame>
  );
}
