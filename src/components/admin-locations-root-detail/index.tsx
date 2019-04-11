import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import colorVariables from '@density/ui/variables/colors.json';

import styles from './styles.module.scss';

import {
  AppFrame,
  AppPane,
  AppSidebar,
  AppBar,
  AppBarSection,
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
          title="Levels"
          template={item => spaces.data.filter(space => space.spaceType === 'floor' && space.ancestry.map(a => a.id).includes(item.id)).length}
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
          title="Rent"
          template={item => 'HARDCODED'}
          href={item => `#/admin/locations/${item.id}`}
        />
        <ListViewColumn
          title="Seats"
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

export default function AdminLocationsRootDetail({ spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(space => space.ancestry.length === 0);
  const campuses = visibleSpaces.filter(space => space.spaceType === 'campus');
  const spacesInEachCampus = campuses.map(campus => spaces.data.filter(space => space.parentId === campus.id));
  const buildingsNotInCampus = visibleSpaces.filter(space => space.spaceType === 'building');

  return (
    <div className={styles.wrapper}>
      {buildingsNotInCampus.length > 0 ? (
        <Fragment>
          <AdminLocationsSubheader title="Buildings" supportsHover={false} />
          <SpaceList spaces={spaces} renderedSpaces={buildingsNotInCampus} />
        </Fragment>
      ) : null}

      {campuses.map((campus, index) => {
        return (
          <div key={campus.id} className={styles.section}>
            <AdminLocationsSubheader title={campus.name} spaceId={campus.id} />
            <SpaceList spaces={spaces} renderedSpaces={spacesInEachCampus[index]} />
          </div>
        );
      })}
    </div>
  );
}
