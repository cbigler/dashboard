import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import AdminLocationsSubheader  from '../admin-locations-subheader/index';

import {
  AppFrame,
  AppPane,
  AppSidebar,
  Icons,
} from '@density/ui';

export default function AdminLocationsCampusDetail({ spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === (selectedSpace ? selectedSpace.id : null));
  return (
    <AppFrame>
      <AppSidebar visible>
        TODO: Waiting on mockups
      </AppSidebar>
      <AppPane>
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
                title="Capacity"
                template={item => item.capacity === null ? <Fragment>&mdash;</Fragment> : item.capacity}
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
        </div>
      </AppPane>
    </AppFrame>
  );
}
