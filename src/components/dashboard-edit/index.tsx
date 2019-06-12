import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import GenericLoadingState from '../generic-loading-state';

import {
  AppFrame,
  AppPane,
  AppBar,
  AppBarTitle,
  AppBarSection,
  Button,
  ButtonGroup,
  Icons,
} from '@density/ui';

export function DashboardEdit({ dashboards, selectedDashboard }) {
  return (
    <Fragment>
      {dashboards.view === 'LOADING' ? (
        <div className={styles.centered}>
          <GenericLoadingState />
        </div>
      ) : null}

      {dashboards.view === 'VISIBLE' ? (
        <AppFrame>
          <AppPane>
            <AppBar>
              <AppBarTitle>
                <a className={styles.backArrow} href={`#/dashboards/${selectedDashboard.id}`}>
                  <Icons.ArrowLeft />
                </a>
                Edit "{selectedDashboard.name}"
              </AppBarTitle>
            </AppBar>
            <div className={styles.dashboardEdit}>
              <h1>{selectedDashboard.name}</h1>
              {JSON.stringify(selectedDashboard, null, 2)}
            </div>
          </AppPane>
        </AppFrame>
      ) : null}
    </Fragment>
  )
}

export default connect((state: any) => ({
  foo: 1,
  dashboards: state.dashboards,
  selectedDashboard: state.dashboards.data.find(dashboard => dashboard.id === state.dashboards.selected),
}), dispatch => ({
}))(DashboardEdit);
