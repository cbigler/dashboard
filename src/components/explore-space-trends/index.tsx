import React from 'react';
import { connect } from 'react-redux';

import ExploreSpaceHeader from '../explore-space-header/index';
import UtilizationCard from '../explore-space-detail-utilization-card/index';
import ErrorBar from '../error-bar/index';

import DailyMetricsCard from '../explore-space-detail-daily-metrics-card/index';
import HourlyBreakdownCard from '../explore-space-detail-hourly-breakdown-card/index';

import styles from './styles.module.scss';

import isMultiWeekSelection from '../../helpers/multi-week-selection/index';
import {
  getShownTimeSegmentsForSpace,
} from '../../helpers/time-segments/index';

function ExploreSpaceTrendsRaw ({
  spaces,
  space,
  spaceHierarchy,
  activeModal,
}: any) {
  if (space) {
    const shownTimeSegments = getShownTimeSegmentsForSpace(space, spaceHierarchy.data);

    // Which time segment label was selected?
    const selectedTimeSegmentLabel = spaces.filters.timeSegmentLabel;

    // And, with the knowlege of the selected space, which time segment within that time segment
    // label is applicable to this space?
    const applicableTimeSegments = shownTimeSegments.filter(i => i.label === selectedTimeSegmentLabel);

    const multiWeekSelection = isMultiWeekSelection(spaces.filters.startDate, spaces.filters.endDate);

    return <div className={styles.exploreSpaceTrendsPage}>
      <ErrorBar
        message={spaces.error}
        modalOpen={activeModal.name !== null}
      />

      {spaces.filters.startDate && spaces.filters.endDate ? <ExploreSpaceHeader /> : null}

      {spaces.filters.startDate && spaces.filters.endDate ? (
        <div className={styles.exploreSpaceTrendsContainer} >
          <div className={styles.exploreSpaceTrends}>
            <div className={styles.exploreSpaceTrendsItem}>
              <DailyMetricsCard
                space={space}
                startDate={spaces.filters.startDate}
                endDate={spaces.filters.endDate}
                timeSegmentLabel={selectedTimeSegmentLabel}
              />
            </div>
            <div className={styles.exploreSpaceTrendsItem}>
              <HourlyBreakdownCard 
                space={space}
                startDate={spaces.filters.startDate}
                endDate={spaces.filters.endDate}
                metric="VISITS"
                title="Hourly Breakdown - Visits"
                aggregation="NONE"
              />
            </div>
            <div className={styles.exploreSpaceTrendsItem}>
              <HourlyBreakdownCard 
                space={space}
                startDate={spaces.filters.startDate}
                endDate={spaces.filters.endDate}
                metric="PEAKS"
                title={multiWeekSelection ? "Hourly Breakdown - Average Peak Occupancy" : "Hourly Breakdown - Peak Occupancy"}
                aggregation="AVERAGE"
              />
            </div>
            <div className={styles.exploreSpaceTrendsItem}>
              <UtilizationCard
                space={space}
                startDate={spaces.filters.startDate}
                endDate={spaces.filters.endDate}
                timeSegmentLabel={selectedTimeSegmentLabel}
                timeSegments={applicableTimeSegments}
              />
            </div>
          </div>
        </div>
      ) : null}
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
})(React.memo(ExploreSpaceTrendsRaw));
