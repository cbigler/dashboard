import React from 'react';
import { connect } from 'react-redux';

import styles from './styles.module.scss';

export function DashboardsList({ dashboards }) {
  if (dashboards.error) {
    return (
      <div className={styles.dashboardsList}>
        <h1>Error loading dashboards</h1>
        <span>{dashboards.error}</span>
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
  return {};
})(DashboardsList);
