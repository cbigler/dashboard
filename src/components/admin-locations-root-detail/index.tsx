import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import colorVariables from '@density/ui/variables/colors.json';
import convertUnit, { UNIT_NAMES } from '../../helpers/convert-unit/index';

import styles from './styles.module.scss';

import {
  AppFrame,
  AppPane,
  AppSidebar,
  AppBar,
  AppBarSection,
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
              <div className={styles.infoWrapper}>
                <span className={styles.name}>{item.name}</span>
                {item.address ? (
                  <span className={styles.address}>{item.address || ''}</span>
                ) : null}
              </div>
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

export default function AdminLocationsRootDetail({ user, spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(space => space.ancestry.length === 0);
  const campuses = visibleSpaces.filter(space => space.spaceType === 'campus');
  const spacesInEachCampus = campuses.map(campus => spaces.data.filter(space => space.parentId === campus.id));
  const buildingsNotInCampus = visibleSpaces.filter(space => space.spaceType === 'building');

  return (
    <div className={styles.wrapper}>
      {buildingsNotInCampus.length > 0 ? (
        <Fragment>
          <AdminLocationsSubheader title="Buildings" supportsHover={false} />
          <SpaceList user={user} spaces={spaces} renderedSpaces={buildingsNotInCampus} />
        </Fragment>
      ) : null}

      {campuses.map((campus, index) => {
        return (
          <div key={campus.id} className={styles.section}>
            <AdminLocationsSubheader
              title={campus.name}
              subtitle={campus.address}
              spaceId={campus.id}
            />
            <SpaceList user={user} spaces={spaces} renderedSpaces={spacesInEachCampus[index]} />
          </div>
        );
      })}
    </div>
  );
}
