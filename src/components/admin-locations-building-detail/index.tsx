import React, { Fragment, useState } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import colorVariables from '@density/ui/variables/colors.json';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  Button,
  Skeleton,
  Icons,
} from '@density/ui';

function AdminLocationsSubheader({title, spaceId=null, supportsHover=true}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      className={classnames(styles.subheader, {
        [styles.hover]: supportsHover && hover,
        [styles.supportsHover]: supportsHover,
      })}
      href={spaceId ? `#/admin/locations/${spaceId}` : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AppBar>
        <AppBarSection>
          <span
            className={classnames(styles.title, {[styles.hover]: supportsHover && hover})}
          >{title}</span>
        </AppBarSection>
        {supportsHover ? (
          <AppBarSection>
            <span className={classnames(styles.manageLink, {[styles.hover]: hover})}>Manage</span>
            <Icons.ArrowRight color={hover ? colorVariables.brandPrimary : colorVariables.gray} />
          </AppBarSection>
        ) : null}
      </AppBar>
    </a>
  );
}

function AdminLocationsBuildingDetailSpaceList({ spaces }) {
  return (
    <div className={styles.spaceList}>
      <ListView data={spaces}>
        <ListViewColumn
          title="Info"
          template={item => (
            <Fragment>
              <div className={styles.itemImage}>
                <Icons.Image color="#fff" />
              </div>
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
  const visibleSpaces = spaces.data.filter(s => s.parentId === (selectedSpace ? selectedSpace.id : null));
  const floors = visibleSpaces.filter(space => space.spaceType === 'floor');
  const spacesInEachFloor = floors.map(floor => spaces.data.filter(space => space.parentId === floor.id));
  const spacesNotInFloor = visibleSpaces.filter(space => floors.find(floor => space.parentId === floor.id));

  return (
    <div className={styles.adminLocationsBuildingDetail}>
      {spaces.view === 'VISIBLE' ? (
        <Fragment>
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
        </Fragment>
      ) : null}
    </div>
  );
}
