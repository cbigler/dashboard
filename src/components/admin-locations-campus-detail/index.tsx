import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';

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
        <div className={styles.wrapper}>
          <ListView data={visibleSpaces}>
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
              title="Levels"
              template={item => '0'}
              href={item => `#/admin/locations/${item.id}`}
            />
            <ListViewColumn
              title="Spaces"
              template={item => '1200'}
              href={item => `#/admin/locations/${item.id}`}
            />
            <ListViewColumn
              title="Size (sq ft)"
              template={item => '8'}
              href={item => `#/admin/locations/${item.id}`}
            />
            <ListViewColumn
              title="Rent"
              template={item => '12'}
              href={item => `#/admin/locations/${item.id}`}
            />
            <ListViewColumn
              title="Seats"
              template={item => '2'}
              href={item => `#/admin/locations/${item.id}`}
            />
            <ListViewColumn
              title="Capacity"
              template={item => '2'}
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
      </AppPane>
    </AppFrame>
  );
}
