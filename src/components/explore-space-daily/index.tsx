import styles from './styles.module.scss';

import React from 'react';
import { connect } from 'react-redux';

import ExploreSpaceHeader from '../explore-space-header/index';
import FootTrafficCard from '../explore-space-detail-foot-traffic-card/index';
import RawEventsCard from '../explore-space-detail-raw-events-card/index';
import ErrorBar from '../error-bar/index';

import {
  getShownTimeSegmentsForSpace,
} from '../../helpers/time-segments/index';

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

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    space: state.spaces.data.find(space => space.id === state.spaces.selected),
    spaceHierarchy: state.spaceHierarchy,
    activeModal: state.activeModal,
    resizeCounter: state.resizeCounter,
  };
})(React.memo(ExploreSpaceDailyRaw));
