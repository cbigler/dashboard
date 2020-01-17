import styles from './styles.module.scss';

import React from 'react';

import ExploreSpaceHeader from '../explore-space-header/index';
import RawEventsExportCard from '../explore-space-detail-raw-events-export-card/index';

// import collectionSpacesFilter from '../../rx-actions/collection/spaces/filter';
import useRxStore from '../../helpers/use-rx-store';
// import ActiveModalStore from '../../rx-stores/active-modal';
import SpacesLegacyStore from '../../rx-stores/spaces-legacy';
// import useRxDispatch from '../../helpers/use-rx-dispatch';

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


const ConnectedExploreSpaceDataExport: React.FC<Any<FixInRefactor>> = (connectedProps) => {

  // const dispatch = useRxDispatch();
  const spaces = useRxStore(SpacesLegacyStore);
  // const activeModal = useRxStore(ActiveModalStore);

  // FIXME: the spaces store should handle this one too
  const space = spaces.data.find(s => s.id === spaces.selected);

  // FIXME: these props were previously provided by "connect" but aren't being used:
  //  - activeModal
  //  - onChangeSpaceFilter
  
  // const onChangeSpaceFilter = (key, value) => {
  //   dispatch(collectionSpacesFilter(key, value) as Any<FixInRefactor>);
  // }

  return (
    <ExploreSpaceDataExportRaw
      spaces={spaces}
      space={space}
      // activeModal={activeModal}
      // onChangeSpaceFilter={onChangeSpaceFilter}
    />
  )
}

export default ConnectedExploreSpaceDataExport;
