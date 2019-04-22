import React, { ReactNode, Fragment } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import colorVariables from '@density/ui/variables/colors.json';

import GenericErrorState from '../generic-error-state/index';
import ListView, { ListViewColumn } from '../list-view/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsRootDetail from '../admin-locations-root-detail/index';
import AdminLocationsCampusDetail from '../admin-locations-campus-detail/index';
import AdminLocationsBuildingDetail from '../admin-locations-building-detail/index';
import AdminLocationsFloorDetail from '../admin-locations-floor-detail/index';
import AdminLocationsSpaceDetail from '../admin-locations-space-detail/index';

import { DensitySpace } from '../../types';
import {
  AppFrame,
  AppPane,
  AppSidebar,
  AppBar,
  AppBarSection,
  AppBarTitle,
  Button,
  Skeleton,
  Icons,
} from '@density/ui';

import {
  AdminLocationsLeftPaneDataRow,
  AdminLocationsLeftPaneDataRowItem,
} from '../admin-locations-left-pane-data-row/index';

import Breadcrumb from '../admin-locations-breadcrumb/index';

function generateCreateRoute(parentId, type) {
  if (parentId) {
    // Not at the root, so there's a parent space id to include in the route
    return `#/admin/locations/${parentId}/create/${type}`;
  } else {
    // At the root, there's no parent space id
    return `#/admin/locations/create/${type}`;
  }
}


function ActionButtons({spaceId, spaceType}) {
  switch (spaceType) {
  case null:
    return (
      <Fragment>
        <span className={styles.leftButton}>
          <Button
            type="primary"
            onClick={() => { window.location.href = generateCreateRoute(spaceId, 'campus'); }}
          >Add a Campus</Button>
        </span>
        <span className={styles.rightButton}>
          <Button
            type="primary"
            onClick={() => { window.location.href = generateCreateRoute(spaceId, 'building'); }}
          >Add a Building</Button>
        </span>
      </Fragment>
    );
  case 'campus':
    return (
      <Fragment>
        <Button
          type="primary"
          onClick={() => { window.location.href = generateCreateRoute(spaceId, 'building'); }}
        >Add a Building</Button>
      </Fragment>
    );
  case 'building':
    return (
      <Fragment>
        <span className={styles.leftButton}>
          <Button
            type="primary"
            onClick={() => { window.location.href = generateCreateRoute(spaceId, 'floor'); }}
          >Add a Level</Button>
        </span>
        <span className={styles.rightButton}>
          <Button
            type="primary"
            onClick={() => { window.location.href = generateCreateRoute(spaceId, 'space'); }}
          >Add a Room</Button>
        </span>
      </Fragment>
    );
  case 'floor':
    return (
      <Fragment>
        <Button
          type="primary"
          onClick={() => { window.location.href = generateCreateRoute(spaceId, 'space'); }}
        >Add a Room</Button>
      </Fragment>
    );
  case 'space':
    return (
      <Fragment>
        <Button
          type="primary"
          onClick={() => { window.location.href = generateCreateRoute(spaceId, 'space'); }}
        >Add a Room</Button>
      </Fragment>
    );
  default:
    return null;
  }
}

function AdminLocations({user, selectedSpace, spaces}) {
  const visibleSpaces = spaces.data
  .filter(s => s.parentId === (selectedSpace ? selectedSpace.id : null));

  let content: ReactNode = null;
  switch (selectedSpace ? selectedSpace.spaceType : null) {
  case 'campus':
    content = (
      <AdminLocationsCampusDetail user={user} spaces={spaces} selectedSpace={selectedSpace} />
    );
    break;
  case 'building':
    content = (
      <AdminLocationsBuildingDetail user={user} spaces={spaces} selectedSpace={selectedSpace} />
    );
    break;
  case 'floor':
    content = (
      <AdminLocationsFloorDetail user={user} spaces={spaces} selectedSpace={selectedSpace} />
    );
    break;
  case 'space':
    content = (
      <AdminLocationsSpaceDetail user={user} spaces={spaces} selectedSpace={selectedSpace} />
    );
    break;
  case null:
  default:
    content = (
      <AdminLocationsRootDetail spaces={spaces} selectedSpace={selectedSpace} />
    );
    break;
  }

  return (
    <div className={classnames(
      styles.adminLocations,
      {[styles.space]: selectedSpace && selectedSpace.spaceType === 'space'}
    )}>
      {spaces.view === 'LOADING' ? (
        <div className={styles.loading}>
          <AppBar>
            <AppBarSection>
              <Skeleton width={200} height={18} />
            </AppBarSection>
            <AppBarSection>
              <span className={styles.leftButton}>
                <Button type="primary">
                  <Skeleton width={96} color={colorVariables.grayLight} />
                </Button>
              </span>
              <span className={styles.rightButton}>
                <Button type="primary">
                  <Skeleton width={96} color={colorVariables.grayLight} />
                </Button>
              </span>
            </AppBarSection>
          </AppBar>
          <AppFrame>
            <AppSidebar visible width={550}>
              <AppBar>
                <AppBarSection>
                  <Skeleton width={200} height={8} />
                </AppBarSection>
                <AppBarSection>
                  <Button>Edit</Button>
                </AppBarSection>
              </AppBar>
              <div className={styles.loadingMapSkeleton} />
              <AdminLocationsLeftPaneDataRow>
                <AdminLocationsLeftPaneDataRowItem
                  id="size"
                  label="Size (sq ft):"
                  value={<Skeleton height={8} width={36} />}
                />
                <AdminLocationsLeftPaneDataRowItem
                  id="rent"
                  label="Rent (per sq ft):"
                  value={<Skeleton height={8} width={36} />}
                />
              </AdminLocationsLeftPaneDataRow>
              <AdminLocationsLeftPaneDataRow>
                <AdminLocationsLeftPaneDataRowItem
                  id="target-capacity"
                  label="Target Capacity:"
                  value={<Skeleton height={8} width={36} />}
                />
                <AdminLocationsLeftPaneDataRowItem
                  id="capacity"
                  label="Capacity"
                  value={<Skeleton height={8} width={36} />}
                />
                <AdminLocationsLeftPaneDataRowItem
                  id="levels"
                  label="Levels"
                  value={<Skeleton height={8} width={36} />}
                />
                <AdminLocationsLeftPaneDataRowItem
                  id="spaces"
                  label="Spaces"
                  value={<Skeleton height={8} width={36} />}
                />
                <AdminLocationsLeftPaneDataRowItem
                  id="dpus"
                  label="DPUs"
                  value={<Skeleton height={8} width={36} />}
                />
              </AdminLocationsLeftPaneDataRow>
            </AppSidebar>
            <AppPane>
              <AdminLocationsSubheader
                title={<Skeleton width={200} height={18} />}
                supportsHover={false}
              />
              <div className={styles.loadingWrapper}>
                <ListView data={[1, 2]} keyTemplate={i => i}>
                  <ListViewColumn
                    title="Info"
                    flexGrow={1}
                    flexShrink={1}
                    template={() => (
                      <Skeleton width={200} height={16} />
                    )}
                  />
                  <ListViewColumn
                    title=""
                    template={() => (
                      <Skeleton width={200} height={16} />
                    )}
                  />
                </ListView>
              </div>
            </AppPane>
          </AppFrame>
        </div>
      ) : null}

      {spaces.view === 'ERROR' ? (
        <GenericErrorState />
      ) : null}

      {spaces.view === 'VISIBLE' ? (
        <Fragment>
          <div className={styles.appBar}>
            <AppBar>
              <AppBarSection>
                <Breadcrumb space={selectedSpace} spaces={spaces} />
              </AppBarSection>
              <AppBarSection>
                <ActionButtons
                  spaceId={selectedSpace ? selectedSpace.id : null}
                  spaceType={selectedSpace ? selectedSpace.spaceType : null}
                />
              </AppBarSection>
            </AppBar>
          </div>

          {content}
        </Fragment>
      ) : null}
    </div>
  );
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    selectedSpace: state.spaces.data.find(space => state.spaces.selected === space.id),
    user: state.user,
  };
}, (dispatch: any) => {
  return {
  };
})(AdminLocations);
