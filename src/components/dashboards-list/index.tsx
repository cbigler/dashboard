import React from 'react';
import { connect } from 'react-redux';
import { Button } from '@density/ui';

import createDashboard from '../../actions/dashboards/create-dashboard';

import styles from './styles.module.scss';

export function DashboardsList({ dashboards, onCreateDashboard }) {
  if (dashboards.error) {
    return (
      <div className={styles.dashboardsList}>
        <div>
          <h1>Error loading dashboards</h1>
          <span>{dashboards.error}</span>
        </div>
      </div>
    );
  } else if (!dashboards.loading && !dashboards.selected) {
    return (
      <div className={styles.dashboardsList}>
        <div>
          <h1>
            <img src="https://densityco.github.io/assets/images/wave.dfbfe264.png" alt="" />
            Welcome!
          </h1>
          <p>Dashboards are a convient way for you to see the space and data you’re interested in.</p>
          <Button onClick={onCreateDashboard}>Create a dashboard</Button>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export default connect((state: any) => {
  return {
    dashboards: state.dashboards,
  };
}, dispatch => {
  return {
    async onCreateDashboard() {
      dispatch<any>(createDashboard());
    },
  };
})(DashboardsList);
