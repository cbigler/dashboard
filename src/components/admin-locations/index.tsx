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

function ActionButtons({spaceId, spaceType, parentSpaceType}) {
  switch (spaceType) {
  case null:
    return (
      <Fragment>
        <span className={styles.leftButton}>
          <Button
            type="primary"
            onClick={() => { window.location.href = generateCreateRoute(spaceId, 'campus'); }}
          >Add a campus</Button>
        </span>
        <span className={styles.rightButton}>
          <Button
            type="primary"
            onClick={() => { window.location.href = generateCreateRoute(spaceId, 'building'); }}
          >Add a building</Button>
        </span>
      </Fragment>
    );
  case 'campus':
    return (
      <Fragment>
        <Button
          type="primary"
          onClick={() => { window.location.href = generateCreateRoute(spaceId, 'building'); }}
        >Add a building</Button>
      </Fragment>
    );
  case 'building':
    return (
      <Fragment>
        <span className={styles.leftButton}>
          <Button
            type="primary"
            onClick={() => { window.location.href = generateCreateRoute(spaceId, 'floor'); }}
          >Add a level</Button>
        </span>
        <span className={styles.rightButton}>
          <Button
            type="primary"
            onClick={() => { window.location.href = generateCreateRoute(spaceId, 'space'); }}
          >Add a room</Button>
        </span>
      </Fragment>
    );
  case 'floor':
    return (
      <Fragment>
        <Button
          type="primary"
          onClick={() => { window.location.href = generateCreateRoute(spaceId, 'space'); }}
        >Add a room</Button>
      </Fragment>
    );
  case 'space':
    return (
      <Fragment>
        {/* Only show the add a room button when we are not in a room that is within a room */}
        {/* (rooms can only be two levels in depth) */}
        {parentSpaceType !== 'space' ? (
          <Button
            type="primary"
            onClick={() => { window.location.href = generateCreateRoute(spaceId, 'space'); }}
          >Add a room</Button>
        ) : null}
      </Fragment>
    );
  default:
    return null;
  }
}

function AdminLocations({user, selectedSpace, spaces}) {
  const visibleSpaces = spaces.data
  .filter(s => s.parentId === (selectedSpace ? selectedSpace.id : null));

  let selectedSpaceParentSpaceType = null;
  if (selectedSpace) {
    const parentSpace = spaces.data.find(space => space.id === selectedSpace.parentId);
    if (parentSpace) {
      selectedSpaceParentSpaceType = parentSpace.spaceType;
    }
  }

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
      <AdminLocationsRootDetail user={user} spaces={spaces} selectedSpace={selectedSpace} />
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
                  {user.data.permissions.includes('core_write') ? (
                    <Button>Edit</Button>
                  ) : null}
                </AppBarSection>
              </AppBar>
              <div className={styles.loadingMapSkeleton} />
              <AdminLocationsLeftPaneDataRow>
                <AdminLocationsLeftPaneDataRowItem
                  id="size"
                  label="Size (sq unit):"
                  value={<Skeleton height={8} width={36} />}
                />
                <AdminLocationsLeftPaneDataRowItem
                  id="rent"
                  label="Annual rent (per square unit):"
                  value={<Skeleton height={8} width={36} />}
                />
              </AdminLocationsLeftPaneDataRow>
              <AdminLocationsLeftPaneDataRow>
                <AdminLocationsLeftPaneDataRowItem
                  id="target-capacity"
                  label="Target capacity:"
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
                {user.data.permissions.includes('core_write') ? (
                  <ActionButtons
                    spaceId={selectedSpace ? selectedSpace.id : null}
                    spaceType={selectedSpace ? selectedSpace.spaceType : null}
                    parentSpaceType={selectedSpaceParentSpaceType}
                  />
                ) : null}
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
