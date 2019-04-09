import React, { Fragment } from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import GenericErrorState from '../generic-error-state/index';
import colorVariables from '@density/ui/variables/colors.json';
import AdminLocationsBuildingDetail from '../admin-locations-building-detail/index';

import { DensitySpace } from '../../types';
import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  Button,
  Skeleton,
  Icons,
} from '@density/ui';

import Breadcrumb from '../admin-locations-breadcrumb/index';


function ActionButtons({spaceType}) {
  switch (spaceType) {
  case null:
    return (
      <Fragment>
        <span className={styles.leftButton}>
          <Button type="primary">Add a Campus</Button>
        </span>
        <span className={styles.rightButton}>
          <Button type="primary">Add a Building</Button>
        </span>
      </Fragment>
    );
  case 'campus':
    return (
      <Fragment>
        <Button type="primary">Add a Building</Button>
      </Fragment>
    );
  case 'building':
    return (
      <Fragment>
        <span className={styles.leftButton}>
          <Button type="primary">Add a Level</Button>
        </span>
        <span className={styles.rightButton}>
          <Button type="primary">Add a Room</Button>
        </span>
      </Fragment>
    );
  case 'floor':
    return (
      <Fragment>
        <Button type="primary">Add a Room</Button>
      </Fragment>
    );
  default:
    return null;
  }
}

function AdminLocations({selectedSpace, spaces}) {
  const visibleSpaces = spaces.data
  .filter(s => s.parentId === (selectedSpace ? selectedSpace.id : null));

  return (
    <div className={styles.adminLocations}>
      {spaces.view === 'LOADING' ? (
        <div className={styles.appBar}>
          <AppBar>
            <AppBarSection>
              <Skeleton width={200} height={18} />
            </AppBarSection>
            <AppBarSection>
              <span className={styles.leftButton}>
                <Button disabled type="primary">
                  <Skeleton width={96} color={colorVariables.grayLight} />
                </Button>
              </span>
              <span className={styles.rightButton}>
                <Button disabled type="primary">
                  <Skeleton width={96} color={colorVariables.grayLight} />
                </Button>
              </span>
            </AppBarSection>
          </AppBar>
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
                <ActionButtons spaceType={selectedSpace ? selectedSpace.spaceType : null} />
              </AppBarSection>
            </AppBar>
          </div>

          {selectedSpace && selectedSpace.spaceType === 'building' ? (
            <AdminLocationsBuildingDetail spaces={spaces} selectedSpace={selectedSpace} />
          ) : (
            <ul>
              {
                spaces.data
                .filter(s => s.parentId === (selectedSpace ? selectedSpace.id : null))
                .map(space => (
                  <li key={space.id}>
                    <a href={`#/admin/locations/${space.id}`}>{space.name}</a>
                  </li>
                ))
              }
            </ul>
          )}
        </Fragment>
      ) : null}
    </div>
  );
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    selectedSpace: state.spaces.data.find(space => state.spaces.selected === space.id),
  };
}, (dispatch: any) => {
  return {
  };
})(AdminLocations);
