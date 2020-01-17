import React, { ReactNode, Fragment } from 'react';
import classnames from 'classnames';
import styles from './styles.module.scss';
import colorVariables from '@density/ui/variables/colors.json';

import GenericErrorState from '../generic-error-state/index';
import AdminLocationsSubheader from '../admin-locations-subheader/index';
import AdminLocationsRootDetail from '../admin-locations-root-detail/index';
import AdminLocationsCampusDetail from '../admin-locations-campus-detail/index';
import AdminLocationsBuildingDetail from '../admin-locations-building-detail/index';
import AdminLocationsFloorDetail from '../admin-locations-floor-detail/index';
import AdminLocationsSpaceDetail from '../admin-locations-space-detail/index';

import {
  AppFrame,
  AppPane,
  AppSidebar,
  AppBar,
  AppBarSection,
  Button,
  ButtonGroup,
  ListView,
  ListViewColumn,
  Skeleton,
} from '@density/ui/src';

import {
  AdminLocationsLeftPaneDataRow,
  AdminLocationsLeftPaneDataRowItem,
} from '../admin-locations-snippets/index';

import Breadcrumb from '../admin-locations-breadcrumb/index';
import useRxStore from '../../helpers/use-rx-store';
import UserStore from '../../rx-stores/user';
import SpacesLegacyStore from '../../rx-stores/spaces-legacy';
import SpaceManagementStore from '../../rx-stores/space-management';

function generateCreateRoute(parent_id, type) {
  if (parent_id) {
    // Not at the root, so there's a parent space id to include in the route
    return `#/admin/locations/${parent_id}/create/${type}`;
  } else {
    // At the root, there's no parent space id
    return `#/admin/locations/create/${type}`;
  }
}

function ActionButtons({space_id, space_type, parentSpaceType}) {
  switch (space_type) {
  case null:
    return (
      <ButtonGroup>
        <Button
          variant="filled"
          href={generateCreateRoute(space_id, 'campus')}
        >Add a campus</Button>
        <Button
          variant="filled"
          href={generateCreateRoute(space_id, 'building')}
        >Add a building</Button>
      </ButtonGroup>
    );
  case 'campus':
    return (
      <Button
        variant="filled"
        href={generateCreateRoute(space_id, 'building')}
      >Add a building</Button>
    );
  case 'building':
    return (
      <ButtonGroup>
        <Button
          variant="filled"
          href={generateCreateRoute(space_id, 'floor')}
        >Add a floor</Button>
        <Button
          variant="filled"
          href={generateCreateRoute(space_id, 'space')}
        >Add a space</Button>
      </ButtonGroup>
    );
  case 'floor':
    return (
      <Button
        variant="filled"
        href={generateCreateRoute(space_id, 'space')}
      >Add a space</Button>
    );
  case 'space':
    return (
      <Fragment>
        {/* Only show the add a space button when we are not in a space that is within a space */}
        {/* (spaces can only be two levels in depth) */}
        {parentSpaceType !== 'space' ? (
          <Button
            variant="filled"
            href={generateCreateRoute(space_id, 'space')}
          >Add a space</Button>
        ) : null}
      </Fragment>
    );
  default:
    return null;
  }
}

function AdminLocations({user, selectedSpace, spaces, spaceManagement}) {
  let selectedSpaceParentSpaceType = null;
  if (selectedSpace) {
    const parentSpace = spaces.data.find(space => space.id === selectedSpace.parent_id);
    if (parentSpace) {
      selectedSpaceParentSpaceType = parentSpace.space_type;
    }
  }

  let content: ReactNode = null;
  switch (selectedSpace ? selectedSpace.space_type : null) {
  case 'campus':
    content = (
      <AdminLocationsCampusDetail user={user} spaces={spaces} selectedSpace={selectedSpace} spaceManagement={spaceManagement} />
    );
    break;
  case 'building':
    content = (
      <AdminLocationsBuildingDetail user={user} spaces={spaces} selectedSpace={selectedSpace} spaceManagement={spaceManagement} />
    );
    break;
  case 'floor':
    content = (
      <AdminLocationsFloorDetail user={user} spaces={spaces} selectedSpace={selectedSpace} spaceManagement={spaceManagement} />
    );
    break;
  case 'space':
    content = (
      <AdminLocationsSpaceDetail user={user} spaces={spaces} selectedSpace={selectedSpace} spaceManagement={spaceManagement} />
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
      {[styles.space]: selectedSpace && selectedSpace.space_type === 'space'}
    )}>
      {spaces.view === 'LOADING' ? (
        <div className={styles.loading}>
          <AppBar>
            <AppBarSection>
              <Skeleton width={200} height={18} />
            </AppBarSection>
            <AppBarSection>
              <ButtonGroup>
                <Button variant="filled">
                  <Skeleton width={96} color={colorVariables.grayLight} />
                </Button>
                <Button variant="filled">
                  <Skeleton width={96} color={colorVariables.grayLight} />
                </Button>
              </ButtonGroup>
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
                  id="floors"
                  label="Floors"
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
                    id="Info"
                    width="auto"
                    template={() => (
                      <Skeleton width={200} height={16} />
                    )}
                  />
                  <ListViewColumn
                    width={200}
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
                    space_id={selectedSpace ? selectedSpace.id : null}
                    space_type={selectedSpace ? selectedSpace.space_type : null}
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

const ConnectedAdminLocations: React.FC = () => {

  const user = useRxStore(UserStore);
  const spaces = useRxStore(SpacesLegacyStore);
  const spaceManagement = useRxStore(SpaceManagementStore);

  // FIXME: this again
  const selectedSpace = spaces.data.find(s => s.id === spaces.selected)

  return (
    <AdminLocations
      user={user}
      spaces={spaces}
      selectedSpace={selectedSpace}
      spaceManagement={spaceManagement}
    />
  )
}
export default ConnectedAdminLocations;
