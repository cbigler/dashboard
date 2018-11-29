import React from 'react';
import { connect } from 'react-redux';

import SetCapacityModal from '../explore-set-capacity-modal/index';

import collectionSpacesUpdate from '../../actions/collection/spaces/update';
import { calculate as calculateTrendsModules } from '../../actions/route-transition/explore-space-trends';

import { getParentsOfSpace } from '../../helpers/filter-hierarchy/index';

import { IconChevronRight } from '@density/ui-icons';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

export function ExploreSpaceHeader({
  spaces,
  space,
  activeModal,

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
        space={activeModal.data.space}
        onSubmit={capacity => onSetCapacity(activeModal.data.space, capacity)}
        onDismiss={onCloseModal}
      /> : null}

      <div className="explore-space-header-container">
        <div className="explore-space-header">
          <h1 className="explore-space-header-text">{space.name}</h1>

          {/* Attempt to display a nicer representation of the time zone, but fall back on the time zone name */}
          <div className="explore-space-header-row">
            <div className="explore-space-header-capacity">
              {space.capacity ? <span>
                Capacity: {space.capacity} <span
                  className="explore-space-header-capacity-update-link"
                  onClick={() => {
                    return onOpenModal('set-capacity', {space});
                  }}
                  role="button"
                >Edit</span>
              </span> : <span>
                <a
                  className="explore-space-header-capacity-set-link"
                  href=''
                  onClick={() => {
                    return onOpenModal('set-capacity', {space});
                  }}
                >Set Capacity</a>
              </span>}
            </div>
            <div className="explore-space-header-time-zone">
              Time Zone: <span className="visualization-space-detail-header-time-zone-label">
                {({
                  'America/New_York': 'US Eastern',
                  'America/Chicago': 'US Central',
                  'America/Denver': 'US Mountain',
                  'America/Los_Angeles': 'US Pacific',
                })[space.timeZone] || space.timeZone}
              </span>
            </div>
          </div>

          <div className="explore-space-header-hierarchy">
            {
              getParentsOfSpace(spaces.data, space).reverse()
                .slice(0, -1) /* Remove the final space */
                .map(id => spaces.data.find(s => s.id === id))
                .map(space => space.name)
                .reduce((acc, name) => {
                  return [
                    ...acc,
                    <IconChevronRight color="cinder" width={10} height={10} key={`${name}-arrow`} />,
                    <span
                      className="explore-space-header-hierarchy-level"
                      key={name}
                    >{name}</span>,
                  ];
                }, [])
                .slice(1)
            }
          </div>
        </div>
      </div>
    </div>;
  } else {
    return null;
  }
}

export default connect(state => {
  return {
    spaces: state.spaces,
    space: state.spaces.data.find(space => space.id === state.spaces.selected),
    activeModal: state.activeModal,
  };
}, dispatch => {
  return {
    onOpenModal(name, data) {
      dispatch(showModal(name, data));
    },
    onCloseModal() {
      dispatch(hideModal());
    },
    async onSetCapacity(space, capacity) {
      const ok = await dispatch(collectionSpacesUpdate({...space, capacity}));
      if (ok) {
        dispatch(hideModal());
        dispatch(calculateTrendsModules(space));
      }
    },
  };
})(ExploreSpaceHeader);
