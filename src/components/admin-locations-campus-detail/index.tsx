import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsListViewImage  from '../admin-locations-list-view-image/index';
import AdminLocationsSubheader  from '../admin-locations-subheader/index';

import AdminLocationsSpaceMap from '../admin-locations-space-map/index';
import { getAreaUnit } from '../admin-locations-detail-modules/index';

import {
  AdminLocationsLeftPaneDataRow,
  AdminLocationsLeftPaneDataRowItem,
} from '../admin-locations-left-pane-data-row/index';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  AppFrame,
  AppPane,
  AppSidebar,
  Button,
  Icons,
} from '@density/ui';

export default function AdminLocationsCampusDetail({ spaces, selectedSpace }) {
  const visibleSpaces = spaces.data.filter(s => s.parentId === (selectedSpace ? selectedSpace.id : null));
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
            id="buildings"
            label="Buildings:"
            value={
              spaces.data
              .filter(space =>
                space.spaceType === 'buildings' &&
                space.ancestry.map(a => a.id).includes(selectedSpace.id)
              ).length
            }
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
