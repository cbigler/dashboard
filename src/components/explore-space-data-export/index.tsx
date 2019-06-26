import styles from './styles.module.scss';

import React from 'react';
import { connect } from 'react-redux';

import ExploreSpaceHeader from '../explore-space-header/index';
import RawEventsExportCard from '../explore-space-detail-raw-events-export-card/index';

import collectionSpacesFilter from '../../actions/collection/spaces/filter';

function ExploreSpaceDataExportRaw({
  spaces,
  space,
}) {
  if (space) {
    return <div className={styles.exploreSpaceDataExportPage}>
      <ExploreSpaceHeader />

      {spaces.filters.startDate && spaces.filters.endDate ? (
        <div className={styles.exploreSpaceDataExportContainer}>
          <div className={styles.exploreSpaceDataExport}>
            <div className={styles.exploreSpaceDataExportItem}>
              <RawEventsExportCard
                space={space}
                startDate={spaces.filters.startDate}
                endDate={spaces.filters.endDate}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>;
  } else {
    return <br />;
  }
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    space: state.spaces.data.find(space => space.id === state.spaces.selected),
    activeModal: state.activeModal,
  };
}, dispatch => {
  return {
    onChangeSpaceFilter(key, value) {
      dispatch(collectionSpacesFilter(key, value));
    },
  };
})(React.memo(ExploreSpaceDataExportRaw));
