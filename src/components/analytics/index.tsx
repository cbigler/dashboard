import React from 'react';
import styles from './styles.module.scss';

import { RxReduxStore } from '../../rx-stores';
import AnalyticsStore from '../../rx-stores/analytics';
import useRxStore from '../../helpers/use-rx-store';
import useRxDispatch from '../../helpers/use-rx-dispatch';

export default function Analytics() {
  const { spaces, spaceHierarchy } = useRxStore(RxReduxStore);
  const state = useRxStore(AnalyticsStore);
  const dispatch = useRxDispatch();

  return (
    <div className={styles.analytics}>
      This is the analytics page!
    </div>
  );
}
