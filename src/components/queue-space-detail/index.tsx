
import React, { useState } from 'react';
import {
  Icons
} from '@density/ui/src';
import colorVariables from '@density/ui/variables/colors.json';
import useRxStore from '../../helpers/use-rx-store';
import QueueStore from '../../rx-stores/queue';

import styles from './styles.module.scss';
import { Hidden } from '@material-ui/core';
import { relative } from 'path';
import { ResourceStatus } from '../../types/resource';

const CapacityChart: React.FunctionComponent<{
  outerRadius: number,
  outerBorderWidth: number,
  percentFull: number,
  color: string,
}> = ({
  outerRadius,
  outerBorderWidth,
  percentFull,
  color,
}) => {
  return (
    <div style={{
       width: outerRadius,
       height: outerRadius,
       borderRadius: '50%',
       border: `${outerBorderWidth}px solid ${color}`,
     }}
    >
      <div style={{
        width: outerRadius - outerBorderWidth*2,
        height: outerRadius - outerBorderWidth*2,
        position: 'relative',
        left: outerBorderWidth,
        top: outerBorderWidth,
        borderRadius: '50%',
        overflow: 'hidden',
      }}
      >
        <div style={{
          backgroundColor: color,
          width: '100%',
          height: '100%',
          position: 'relative',
          top: `${100 - percentFull}%`,
        }}></div>
      </div>
    </div>
  );
}

const QueueSpaceDetail: React.FunctionComponent = () => {
  const state = useRxStore(QueueStore)
  const selected = state.selected;

  if (selected.status === ResourceStatus.LOADING) {
    return (<h2>Hold up, k?</h2>)
  }
  else if (selected.status === ResourceStatus.ERROR) {
    return (<h2>Uh oh.</h2>)
  }

  return (
    <div className={styles.queueDetailPage}>
      <div className={styles.queueActionSection}>
        <div className={styles.queueSettings}>
          <Icons.Cog
            color={'#0D183A'}
            width={40}
            height={40}
          />
        </div>
        <div className={styles.queueCapacity}>
          <CapacityChart
            outerRadius={48}
            outerBorderWidth={9}
            percentFull={40}
            color='#ffffff'
          />
          <h2>Capacity</h2>
        </div>
        <div className={styles.queueWaitTime}>
          <Icons.StopWatch
            color='#ffffff'
            width={87}
            height={96}
          />
          <h2>Wait Time</h2>
        </div>
        <h1 className={styles.queueActionText}>
          Go
        </h1>
      </div>
      <div className={styles.queueDetailSection}>

      </div>
    </div>
  );
}

export default QueueSpaceDetail;
