import React from 'react';
import classnames from 'classnames';
import { connect } from 'react-redux';

import { DensityMark } from '@density/ui';

import autoRefreshHoc from '../../helpers/auto-refresh-hoc/index';

import { chartAsReactComponent } from '@density/charts';

import styles from './styles.module.scss';

import RealTimeCountFn from '@density/chart-real-time-count';
const RealTimeCountChart = autoRefreshHoc({
  interval: 50,
  shouldComponentUpdate: function (nextProps) {
    return (this as any).props.events.length || nextProps.events.length;
  }
})(chartAsReactComponent(RealTimeCountFn));

export function LiveSpaceDetail({
  space,
  events,
  spacesLoading,
  spacesError,
}) {
  if (spacesLoading) {
    return <div>Loading</div>;
  } else if (spacesError) {
    return <div>Error: {spacesError}</div>;
  } else {
    return <div className={styles.liveSpaceDetail}>
      <div className={styles.liveSpaceDetailMark}>
        <DensityMark size={100} />
      </div>
      <div className={styles.liveSpaceDetailStats}>
        <div className={styles.liveSpaceDetailStatsItem}>
          <h2 className="liveSpaceDetailStatsCount">
            {space.currentCount}
            {space.currentCount === 1 ? ' person' : ' people'}
          </h2>
          <h1 className={styles.liveSpaceDetailStatsName}>{space.name}</h1>
        </div>
      </div>
      <div className={styles.liveSpaceDetailChart}>
        <span className={classnames('real-time-capacity-legend', styles.liveSpaceDetailChartTopHeader)}>
          <div className={classnames('real-time-capacity-count-marker', 'in')} />
          <span>In</span>
          <div className={classnames('real-time-capacity-count-marker', 'out')} />
          <span>Out</span>
        </span>
        <div className={styles.liveSpaceDetailRealTimeChart}>
          <RealTimeCountChart
            events={events[space.id] || []}

            // Customize the chart for a larger view
            eventMarkerRadius={5}
            eventMarkerSpacingFromMidLine={10}
            eventMarkerInfoPopupHeight={30}
            eventMarkerInfoPopupWidth={30}
            eventMarkerInfoPopupSpacingFromMarker={15}
            eventMarkerInfoPopupCaretWidth={10}
            eventMarkerInfoPopupFontSize={20}
          />
        </div>
        <ul className="real-time-capacity-labels">
          <li className="real-time-capacity-labels-item">1m ago</li>
          <li className="real-time-capacity-labels-item">Now</li>
        </ul>
      </div>
    </div>;
  }
}

export default connect((state: any) => {
  return {
    space: state.spaces.data.find(space => space.id === state.spaces.selected),
    events: state.spaces.events,

    spacesLoading: state.spaces.loading,
    spacesError: state.spaces.error,
  };
}, dispatch => {
  return {
  };
})(LiveSpaceDetail);
