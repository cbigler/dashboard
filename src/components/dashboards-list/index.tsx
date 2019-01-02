import React from 'react';
import { connect } from 'react-redux';

export function DashboardsList({ dashboards }) {
  if (dashboards.error) {
    return (
      <div className="dashboards-list">
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
