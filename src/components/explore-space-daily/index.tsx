import styles from './styles.module.scss';

import React from 'react';

import ExploreSpaceHeader from '../explore-space-header/index';
import FootTrafficCard from '../explore-space-detail-foot-traffic-card/index';
import RawEventsCard from '../explore-space-detail-raw-events-card/index';
import ErrorBar from '../error-bar/index';

import {
  getShownTimeSegmentsForSpace,
} from '../../helpers/time-segments/index';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore from '../../rx-stores/active-modal';
import SpacesStore from '../../rx-stores/spaces';
import SpaceHierarchyStore from '../../rx-stores/space-hierarchy';
// import ResizeCounterStore from '../../rx-stores/resize-counter';

export function ExploreSpaceDailyRaw ({
  spaces,
  space,
  spaceHierarchy,
  activeModal,
}) {

  if (space) {
    const shownTimeSegments = getShownTimeSegmentsForSpace(space, spaceHierarchy.data);

    // Which time segment label was selected?
    const selectedTimeSegmentLabel = spaces.filters.timeSegmentLabel;

    // And, with the knowlege of the selected space, which time segment within that time segment
    // label is applicable to this space?
    const applicableTimeSegments = shownTimeSegments.filter(i => i.label === selectedTimeSegmentLabel);

    return <div className={styles.exploreSpaceDailyPage}>
      <ErrorBar
        message={spaces.error}
        modalOpen={activeModal.name !== null}
      />

      <ExploreSpaceHeader />

      <div className={styles.exploreSpaceDailyContainer}>
        <div className={styles.exploreSpaceDaily}>
          <div className={styles.exploreSpaceDailyItem}>
            <FootTrafficCard
              space={space}
              date={spaces.filters.date}
              timeSegmentLabel={selectedTimeSegmentLabel}
              timeSegments={applicableTimeSegments}
            />
          </div>
          <div className={styles.exploreSpaceDailyItem}>
            <RawEventsCard
              space={space}
              date={spaces.filters.date}
              timeSegmentLabel={selectedTimeSegmentLabel}
            />
          </div>
        </div>
      </div>
    </div>;
  } else {
    return null;
  }
}

const ConnectedExploreSpaceDaily: React.FC = () => {

  const activeModal = useRxStore(ActiveModalStore);
  const spaces = useRxStore(SpacesStore);
  const spaceHierarchy = useRxStore(SpaceHierarchyStore);
  // const resizeCounter = useRxStore(ResizeCounterStore);
  
  // FIXME: spaces store should handle this
  const space = spaces.data.find(s => s.id === spaces.selected)

  return (
    <ExploreSpaceDailyRaw
      spaces={spaces}
      spaceHierarchy={spaceHierarchy}
      space={space}
      activeModal={activeModal}
      // resizeCounter={resizeCounter}
    />
  )
}
export default ConnectedExploreSpaceDaily;
