import React from 'react';

import timings from '@density/ui/variables/timings.json';

import styles from './styles.module.scss';

import {
  Card,
  CardBody,
  CardHeader,
} from '@density/ui';

import autoRefreshHoc from '../../helpers/auto-refresh-hoc/index';
import formatCapacityPercentage from '../../helpers/format-capacity-percentage/index';

import { chartAsReactComponent } from '@density/charts';
import RealTimeCountFn from '@density/chart-real-time-count';
import LinearProgressFn from '@density/chart-linear-progress';
const LinearProgress = chartAsReactComponent(LinearProgressFn);
const RealTimeCountChart = autoRefreshHoc({
  shouldComponentUpdate: function (nextProps) {
    if (document.visibilityState !== 'visible') { return false; }
    return (this as any).props.events.length || nextProps.events.length;
  }
})(chartAsReactComponent(RealTimeCountFn));

export default function SpaceCard({
  space,
  events,

  onClickRealtimeChartFullScreen,
  onClickEditCount,
}) {
  if (space) {
    const capacityPercent = space.capacity ? (space.currentCount / space.capacity) * 100 : null;
    return <Card className={styles.spaceCard}>
      <CardHeader className={styles.spaceCardHeader}>
        <span className={styles.spaceCardHeaderName}>{space.name}</span>
        <span className={styles.spaceCardHeaderCount}>{space.currentCount}</span>
      </CardHeader>
      <CardBody>
        <div className={styles.spaceCardCapacityContainer}>
          <div className={styles.spaceCardCapacityInformation}>
            <div className={styles.spaceCardUtilizationPercentage}>
              {
                space.capacity ?
                <span className={styles.spaceCardUtilizationPercentageLabel}>
                  Utilization: 
                  <span> {formatCapacityPercentage(space.currentCount, space.capacity)}%</span>
                </span> :
                'Max capacity not yet specified'
              }
            </div>
            <div className={styles.spaceCardEditCountLink} onClick={onClickEditCount}>Edit count</div>
          </div>
          <div className={styles.spaceCardCapacityLinearProgress}>
            <LinearProgress
              percentFull={capacityPercent || 0}
              transitionDuration={timings.timingBase}
            />
          </div>
        </div>
      </CardBody>

      <div className={styles.spaceCardChart}>
        <div
          className={styles.spaceCardChartFullScreen}
          onClick={onClickRealtimeChartFullScreen}
        >&#xe919;</div>
        <RealTimeCountChart events={events || []} />
      </div>
    </Card>;
  } else {
    return null;
  }
}
