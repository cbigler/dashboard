import React from 'react';
import { Button } from '@density/ui/src';

import createDashboard from '../../rx-actions/dashboards/create-dashboard';

import styles from './styles.module.scss';
import useRxStore from '../../helpers/use-rx-store';
import UserStore from '../../rx-stores/user';
import { getIsReadOnlyUser } from '../../helpers/legacy';
import DashboardsStore from '../../rx-stores/dashboards';
import useRxDispatch from '../../helpers/use-rx-dispatch';

export function DashboardsList({ dashboards, isReadOnlyUser, onCreateDashboard }) {
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
          <p>Dashboards are a convenient way for you to see the space and data you’re interested in.</p>
          {!isReadOnlyUser ? (
            <Button onClick={onCreateDashboard}>Create a dashboard</Button>
          ) : null}
        </div>
      </div>
    );
  } else {
    return null;
  }
}


const ConnectedDashboardsList: React.FC = () => {
  const dispatch = useRxDispatch();
  const user = useRxStore(UserStore);
  const dashboards = useRxStore(DashboardsStore);

  const isReadOnlyUser = getIsReadOnlyUser(user);

  const onCreateDashboard = async () => {
    await createDashboard(dispatch)
  }

  return (
    <DashboardsList
      dashboards={dashboards}
      onCreateDashboard={onCreateDashboard}
      isReadOnlyUser={isReadOnlyUser}
    />
  )
}

export default ConnectedDashboardsList;
