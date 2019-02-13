import * as React from 'react';

import timings from '@density/ui/variables/timings.json';

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
  interval: 50,
  shouldComponentUpdate: function (nextProps) {
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
    return <Card className="space-card">
      <CardHeader className="space-card-header">
        <span className="space-card-header-name">{space.name}</span>
        <span className="space-card-header-count">{space.currentCount}</span>
      </CardHeader>
      <CardBody>
        <div className="space-card-capacity-container">
          <div className="space-card-capacity-information">
            <div className="space-card-utilization-percentage">
              {
                space.capacity ?
                <span className="space-card-utilization-percentage-label">
                  Utilization: 
                  <span> {formatCapacityPercentage(space.currentCount, space.capacity)}%</span>
                </span> :
                'Max capacity not yet specified'
              }
            </div>
            <div className="space-card-edit-count-link" onClick={onClickEditCount}>Edit count</div>
          </div>
          <div className="space-card-capacity-linear-progress">
            <LinearProgress
              percentFull={capacityPercent || 0}
              transitionDuration={timings.timingBase}
            />
          </div>
        </div>
      </CardBody>

      <div className="space-card-chart">
        <div
          className="space-card-chart-full-screen"
          onClick={onClickRealtimeChartFullScreen}
        >&#xe919;</div>
        <RealTimeCountChart events={events || []} />
      </div>
    </Card>;
  } else {
    return null;
  }
}
