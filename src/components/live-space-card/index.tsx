import React from 'react';

import timings from '@density/ui/variables/timings.json';

import styles from './styles.module.scss';

import {
  Card,
  CardBody,
  CardHeader,
} from '@density/ui/src';

import formatCapacityPercentage from '../../helpers/format-capacity-percentage/index';

import { chartAsReactComponent } from '@density/charts';
import RealTimeCountFn from '@density/chart-real-time-count';
import LinearProgressFn from '@density/chart-linear-progress';
const LinearProgress = chartAsReactComponent(LinearProgressFn);
const RealTimeCountChart = chartAsReactComponent(RealTimeCountFn);

export default class SpaceCard extends React.Component<{
  space,
  events,

  onClickRealtimeChartFullScreen,
  onClickEditCount,
}, {}> {
  containerRef;

  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
  }

  shouldComponentUpdate(nextProps) {
    const countChanged = this.props.space.current_count !== nextProps.space.current_count;
    const hasEvents = this.props.events &&
      (this.props.events.length > 0 || nextProps.events.length > 0);
    if (!countChanged && !hasEvents) {
      return false;
    }

    const bounding = this.containerRef.current && this.containerRef.current.getBoundingClientRect();
    const isInViewport = !bounding || (bounding.bottom >= 0 && bounding.right >= 0 &&
      bounding.left <= (window.innerWidth || document.documentElement.clientWidth) &&
      bounding.top <= (window.innerHeight || document.documentElement.clientHeight));
    if (!isInViewport) {
      return false;
    }

    return true;
  }

  render() {
    const {
      space,
      events,
    
      onClickRealtimeChartFullScreen,
      onClickEditCount,
    } = this.props;

    if (space) {
      const capacityPercent = space.capacity ? (space.current_count / space.capacity) * 100 : null;
      return <div ref={this.containerRef}>
        <Card className={styles.spaceCard}>
          <CardHeader className={styles.spaceCardHeader}>
            <span className={styles.spaceCardHeaderName}>{space.name}</span>
            <span className={styles.spaceCardHeaderCount}>{space.current_count}</span>
          </CardHeader>
          <CardBody>
            <div className={styles.spaceCardCapacityContainer}>
              <div className={styles.spaceCardCapacityInformation}>
                <div className={styles.spaceCardUtilizationPercentage}>
                  {
                    space.capacity ?
                    <span className={styles.spaceCardUtilizationPercentageLabel}>
                      Utilization: 
                      <span> {formatCapacityPercentage(space.current_count, space.capacity)}%</span>
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
        </Card>
      </div>;
    } else {
      return null;
    }
  }
}
