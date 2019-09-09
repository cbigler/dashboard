import React from 'react';
import { connect } from 'react-redux';

import SetCapacityModal from '../explore-set-capacity-modal/index';

import collectionSpacesUpdate from '../../actions/collection/spaces/update';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

import styles from './styles.module.scss';
import cleanSpaceData from '../../helpers/clean-space-data';
import spaceReportsCalculateReportData from '../../actions/space-reports/calculate-report-data';

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
                })[space.timeZone] || space.timeZone}
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

export default connect((state: any) => {
  return {
    space: state.spaces.data.find(space => space.id === state.spaces.selected),
    activeModal: state.activeModal,
    spaceReports: state.spaceReports,
  };
}, dispatch => {
  return {
    onOpenModal(name, data) {
      dispatch<any>(showModal(name, data));
    },
    onCloseModal() {
      dispatch<any>(hideModal());
    },
    async onSetCapacity(controllers, space, capacity) {
      const spaceData = cleanSpaceData({...space, capacity});
      const ok = await dispatch<any>(collectionSpacesUpdate(spaceData));
      if (ok) {
        dispatch<any>(hideModal());
        controllers.forEach(controller => {
          dispatch<any>(spaceReportsCalculateReportData(controller, space));
        });
      }
    },
  };
})(React.memo(ExploreSpaceHeaderRaw));
