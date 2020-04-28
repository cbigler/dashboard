import styles from './styles.module.scss';

import React, { useState } from 'react';

import {
  AppFrame,
  AppPane,
  AppScrollView,
} from '@density/ui/src';

import useRxStore from '../../helpers/use-rx-store';
import QueueStore from '../../rx-stores/queue';


const QueueSpaceDetail: React.FunctionComponent = () => {
  const state = useRxStore(QueueStore)
  const selected = state.selected;

  return (
    <AppFrame>
      <AppPane>
        <AppScrollView>
          <div className={styles.accountPage}>
          </div>
        </AppScrollView>
      </AppPane>
    </AppFrame>
  );
}


export default QueueSpaceDetail;
