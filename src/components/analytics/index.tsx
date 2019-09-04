import React, { useState } from 'react';
import styles from './styles.module.scss';

import AnalyticsControlBar from '../analytics-control-bar';
import { QueryInterval } from '../../types/analytics';
import { DATE_RANGES } from '../../helpers/space-time-utilities';

import { RxReduxStore } from '../../rx-stores';
// import AnalyticsStore from '../../rx-stores/analytics';
import useRxStore from '../../helpers/use-rx-store';
// import useRxDispatch from '../../helpers/use-rx-dispatch';

import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';

import {
  AppFrame,
  AppPane,
} from '@density/ui';

export default function Analytics() {
  const { spaces, spaceHierarchy } = useRxStore(RxReduxStore);
  // const state = useRxStore(AnalyticsStore);
  // const dispatch = useRxDispatch();

  const formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy.data);

  const [ filters, setFilters ] = useState<Any<InAHurry>>([]);
  const [ interval, setInterval ] = useState<Any<InAHurry>>(QueryInterval.ONE_HOUR);
  const [ dateRange, setDateRange ] = useState<Any<InAHurry>>(DATE_RANGES.LAST_30_DAYS);

  return (
    <AppFrame>
      <AppPane>
        <div className={styles.analytics}>
          <AnalyticsControlBar
            filters={filters}
            onChangeFilters={setFilters}

            interval={interval}
            onChangeInterval={setInterval}

            dateRange={dateRange}
            onChangeDateRange={setDateRange}

            spaces={spaces.data}
            formattedHierarchy={formattedHierarchy}
          />
        </div>
      </AppPane>
    </AppFrame>
  );
}
