import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';

import { DensitySpace } from '../../types';
import {
  AppBar,
  AppBarSection,
} from '@density/ui';

import Breadcrumb from '../admin-locations-breadcrumb/index';

function AdminLocations({selectedSpace, spaces}) {
  return (
    <div className={styles.adminLocations}>
      {spaces.view === 'LOADING' ? <span>Loading</span> : null}
      {spaces.view === 'VISIBLE' ? (
        <Fragment>
          <AppBar>
            <AppBarSection>
              <Breadcrumb space={selectedSpace} />
            </AppBarSection>
          </AppBar>
          <ul>
            {spaces.data.filter(s => s.parentId === (selectedSpace ? selectedSpace.id : null)).map(s => (
              <li key={s.id}>
                <a href={`#/admin/locations/${s.id}`}>{s.name}</a>
              </li>
            ))}
          </ul>
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
