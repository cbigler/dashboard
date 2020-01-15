import React from 'react';

import SetCapacityModal from '../explore-set-capacity-modal/index';

import collectionSpacesUpdate from '../../rx-actions/collection/spaces/update';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';

import styles from './styles.module.scss';
import cleanSpaceData from '../../helpers/clean-space-data';
import spaceReportsCalculateReportData from '../../rx-actions/space-reports/calculate-report-data';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore from '../../rx-stores/active-modal';
import SpacesStore from '../../rx-stores/spaces';
import SpaceReportsStore from '../../rx-stores/space-reports';
import useRxDispatch from '../../helpers/use-rx-dispatch';

export function ExploreSpaceHeaderRaw({
  space,
  activeModal,
  spaceReports,

  onOpenModal,
  onCloseModal,
  onSetCapacity,
}) {
  if (space) {
    return <div>
      {/* Modal that is used to let the user set the capacity of a space. Shown when the user clicks
      on a 'set capacity' link within a space row if the space capacity isn't set. If the capacity
      is already set, the capacity can be adjusted from within the detail page. */}
      {activeModal.name === 'set-capacity' ? <SetCapacityModal
        visible={activeModal.visible}
        space={activeModal.data.space}
        onSubmit={capacity => onSetCapacity(spaceReports.controllers, activeModal.data.space, capacity)}
        onDismiss={onCloseModal}
      /> : null}

      <div className={styles.exploreSpaceHeaderContainer}>
        <div className={styles.exploreSpaceHeader}>
          {/* Attempt to display a nicer representation of the time zone, but fall back on the time zone name */}
          <div className={styles.exploreSpaceHeaderRow}>
            <div className={styles.exploreSpaceHeaderCapacity}>
              {space.capacity ? <span>
                Capacity: {space.capacity} <span
                  className={styles.exploreSpaceHeaderCapacityUpdateLink}
                  onClick={() => {
                    return onOpenModal('set-capacity', {space});
                  }}
                  role="button"
                >Edit</span>
              </span> : <span>
                <span
                  className={styles.exploreSpaceHeaderCapacitySetLink}
                  onClick={() => {
                    return onOpenModal('set-capacity', {space});
                  }}
                >Set capacity</span>
              </span>}
            </div>
            <div className={styles.exploreSpaceHeaderTimeZone}>
              Time zone: <span className={styles.visualizationSpaceDetailHeaderTimeZoneLabel}>
                {({
                  'America/New_York': 'US Eastern',
                  'America/Chicago': 'US Central',
                  'America/Denver': 'US Mountain',
                  'America/Los_Angeles': 'US Pacific',
                })[space.time_zone] || space.time_zone}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>;
  } else {
    return null;
  }
}


const ConnectedExploreSpaceHeader: React.FC = () => {

  const dispatch = useRxDispatch();
  const spaces = useRxStore(SpacesStore);
  const activeModal = useRxStore(ActiveModalStore);
  const spaceReports = useRxStore(SpaceReportsStore);

  // FIXME: spaces store should handle
  const space = spaces.data.find(s => s.id === spaces.selected)

  const onOpenModal = (name, data) => {
    showModal(dispatch, name, data);
  }

  const onCloseModal = async () => {
    await hideModal(dispatch)
  }

  const onSetCapacity = async (controllers, space, capacity) => {
    const spaceData = cleanSpaceData({ ...space, capacity });
    const ok = await collectionSpacesUpdate(dispatch, spaceData);
    // FIXME: do any of the promises below need to be awaited?
    if (ok) {
      hideModal(dispatch);
      controllers.forEach(controller => {
        spaceReportsCalculateReportData(dispatch, controller, space);
      });
    }
  }

  return (
    <ExploreSpaceHeaderRaw
      space={space}
      spaceReports={spaceReports}
      activeModal={activeModal}

      onOpenModal={onOpenModal}
      onCloseModal={onCloseModal}
      onSetCapacity={onSetCapacity}
    />
  )
}
export default ConnectedExploreSpaceHeader;
