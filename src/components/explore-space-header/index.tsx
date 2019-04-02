import React from 'react';
import { connect } from 'react-redux';

import SetCapacityModal from '../explore-set-capacity-modal/index';

import collectionSpacesUpdate from '../../actions/collection/spaces/update';
import { calculate as calculateTrendsModules } from '../../actions/route-transition/explore-space-trends';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

import styles from './styles.module.scss';

export function ExploreSpaceHeader({
  space,
  activeModal,
  spaceFilters,

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
        onSubmit={capacity => onSetCapacity(activeModal.data.space, capacity, spaceFilters)}
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
                >Set Capacity</span>
              </span>}
            </div>
            <div className={styles.exploreSpaceHeaderTimeZone}>
              Time Zone: <span className={styles.visualizationSpaceDetailHeaderTimeZoneLabel}>
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
    spaceFilters: state.spaces.filters
  };
}, dispatch => {
  return {
    onOpenModal(name, data) {
      dispatch<any>(showModal(name, data));
    },
    onCloseModal() {
      dispatch<any>(hideModal());
    },
    async onSetCapacity(space, capacity, spaceFilters) {
      const ok = await dispatch<any>(collectionSpacesUpdate({...space, capacity}));
      if (ok) {
        dispatch<any>(hideModal());
        dispatch<any>(calculateTrendsModules(space, spaceFilters));
      }
    },
  };
})(ExploreSpaceHeader);
