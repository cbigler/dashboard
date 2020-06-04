import React, { Fragment } from 'react';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';

import styles from './styles.module.scss';

import { ListView, ListViewColumn } from '@density/ui/src';
import { 
  AdminLocationsListLevelsTotal,
  AdminLocationsListRoomsTotal,
  AdminLocationsListSize,
  AdminLocationsListAnnualRent,
  AdminLocationsListTargetCapacity,
  AdminLocationsListCapacity,
  AdminLocationsListSensorsTotal,
  AdminLocationsListRightArrow
} from '../admin-locations-snippets';
import { UserState } from '../../rx-stores/user';
import { SpacesLegacyState } from '../../rx-stores/spaces-legacy';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';


function SpaceList({
  user,
  spaces,
  renderedSpaces,
}: {
  user: UserState,
  spaces: SpacesLegacyState,
  renderedSpaces: CoreSpace[],
}) {
  return (
    <div className={styles.spaceList}>
      <ListView
        data={renderedSpaces}
        onClickRow={item => window.location.href = `#/admin/locations/${item.id}`}
      >
        <ListViewColumn
          id="Info"
          width={320}
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
        />
        <AdminLocationsListLevelsTotal spaces={spaces} />
        <AdminLocationsListRoomsTotal spaces={spaces} />
        <AdminLocationsListSize user={user} />
        <AdminLocationsListAnnualRent />
        <AdminLocationsListTargetCapacity />
        <AdminLocationsListCapacity />
        <AdminLocationsListSensorsTotal />
        <AdminLocationsListRightArrow />
      </ListView>
    </div>
  );
}

export default function AdminLocationsRootDetail({
  user,
  spaces,
  selectedSpace
}: {
  user: UserState,
  spaces: SpacesLegacyState,
  selectedSpace: CoreSpace | undefined
}) {
  // Users that have a purview-limited space scope won't have top level spaces have a parent
  // id of null, instead it will be a space that is not in the user's purview
  const topLevelSpaceIds = [
    null,
    ...spaces.data.filter(space => (
      space.parent_id === null || // parent id is null, or
      !spaces.data.find(s => s.id === space.parent_id) // parent id is a space that's unknown
    )).map(s => s.id),
  ];
  const visibleSpaces = spaces.data.filter(
    s => selectedSpace ? (s.parent_id === selectedSpace.id) : topLevelSpaceIds.includes(s.id)
  );
  const campuses = visibleSpaces.filter(space => space.space_type === 'campus');
  const spacesInEachCampus = campuses.map(campus => spaces.data.filter(space => space.parent_id === campus.id));
  const buildingsNotInCampus = visibleSpaces.filter(space => space.space_type === 'building');

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
              space_id={campus.id}
            />
            <SpaceList user={user} spaces={spaces} renderedSpaces={spacesInEachCampus[index]} />
          </div>
        );
      })}
    </div>
  );
}
