import React from 'react';
import classnames from 'classnames';

import { DensityMark } from '@density/ui/src';

import { chartAsReactComponent } from '@density/charts';

import styles from './styles.module.scss';

import RealTimeCountFn from '@density/chart-real-time-count';
import autoRefresh from '../../helpers/auto-refresh-hoc/index';
import useRxStore from '../../helpers/use-rx-store';
import SpacesStore from '../../rx-stores/spaces';
const RealTimeCountChart = chartAsReactComponent(RealTimeCountFn);

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
            {space.current_count}
            {space.current_count === 1 ? ' person' : ' people'}
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

const AutoRefreshedLiveSpaceDetail = autoRefresh({
  shouldComponentUpdate: function (nextProps) {
    const props = (this as any).props.events[(this as any).props.space.id] ||
      nextProps.events[nextProps.space.id] || [];
    return props.length > 0;
  }
})(LiveSpaceDetail);


// FIXME: are there any actual external props needed?
const ConnectedAutoRefreshedLiveSpaceDetail: React.FC<Any<FixInRefactor>> = (externalProps) => {

  const spaces = useRxStore(SpacesStore);

  // FIXME: this again
  const space = spaces.data.find(s => s.id === spaces.selected);
  const events = spaces.events;
  const spacesLoading = spaces.loading;
  const spacesError = spaces.error;

  return (
    <AutoRefreshedLiveSpaceDetail
      {...externalProps}
      space={space}
      events={events}
      spacesLoading={spacesLoading}
      spacesError={spacesError}
    />
  )
}
export default ConnectedAutoRefreshedLiveSpaceDetail;
