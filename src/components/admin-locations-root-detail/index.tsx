import React, { Fragment } from 'react';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import convertUnit, { UNIT_NAMES } from '../../helpers/convert-unit/index';

import styles from './styles.module.scss';

import { Icons, ListView, ListViewColumn } from '@density/ui';


function SpaceList({ user, spaces, renderedSpaces }) {
  return (
    <div className={styles.spaceList}>
      <ListView
        data={renderedSpaces}
        onClickRow={item => window.location.href = `#/admin/locations/${item.id}`}
      >
        <ListViewColumn
          id="Info"
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
          width="auto"
        />
        <ListViewColumn
          id="Levels"
          template={item => spaces.data.filter(space => space.spaceType === 'floor' && space.ancestry.map(a => a.id).includes(item.id)).length}
        />
        <ListViewColumn
          id="Rooms"
          template={item => spaces.data.filter(space => space.spaceType === 'space' && space.ancestry.map(a => a.id).includes(item.id)).length}
        />
        <ListViewColumn
          id={`Size (${UNIT_NAMES[user.data.sizeAreaDisplayUnit]})`}
          template={item => item.sizeArea && item.sizeAreaUnit ? convertUnit(
            item.sizeArea,
            item.sizeAreaUnit,
            user.data.sizeAreaDisplayUnit,
          ) : <Fragment>&mdash;</Fragment>}
        />
        <ListViewColumn
          id="Annual rent"
          template={item => item.annualRent ? `$${item.annualRent}` : <Fragment>&mdash;</Fragment>}
        />
        <ListViewColumn
          id="Target capacity"
          template={item => item.targetCapacity ? item.targetCapacity : <Fragment>&mdash;</Fragment>}
        />
        <ListViewColumn
          id="Capacity"
          template={item => item.capacity ? item.capacity : <Fragment>&mdash;</Fragment>}
        />
        <ListViewColumn
          id="DPUs"
          template={item => item.sensorsTotal ? item.sensorsTotal : <Fragment>&mdash;</Fragment>}
        />
        <ListViewColumn template={item => <Icons.ArrowRight />} />
      </ListView>
    </div>
  );
}

export default function AdminLocationsRootDetail({ user, spaces, selectedSpace }) {
  // Users that have a purview-limited space scope won't have top level spaces have a parent
  // id of null, instead it will be a space that is not in the user's purview
  const topLevelSpaceIds = [
    null,
    ...spaces.data.filter(space => (
      space.parentId === null || // parent id is null, or
      !spaces.data.find(s => s.id === space.parentId) // parent id is a space that's unknown
    )).map(s => s.id),
  ];
  const visibleSpaces = spaces.data.filter(
    s => selectedSpace ? (s.parentId === selectedSpace.id) : topLevelSpaceIds.includes(s.id)
  );
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
