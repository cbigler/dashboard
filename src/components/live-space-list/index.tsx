import React from 'react';
import { connect } from 'react-redux';
import ErrorBar from '../error-bar/index';

import collectionSpacesFilter from '../../actions/collection/spaces/filter';
import spaceResetCount from '../../actions/collection/spaces/reset-count';
import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

import { InputBox } from '@density/ui';
import SpaceCard from '../live-space-card/index';
import SpaceUpdateModal from '../explore-edit-count-modal/index';

import { CONNECTION_STATES } from '../../helpers/websocket-event-pusher/index';

import SpaceHierarchySelectBox from '../space-hierarchy-select-box/index';

import filterHierarchy from '../../helpers/filter-hierarchy/index';
import filterCollection from '../../helpers/filter-collection/index';
const spaceFilter = filterCollection({fields: ['name']});

export function LiveSpaceList({
  spaces,
  eventPusherStatus,
  activeModal,

  onSpaceSearch,
  onSpaceChangeParent,
  onResetSpace,
  onOpenModal,
  onCloseModal,
}) {
  // Filter space list
  // 1. Using the space hierarchy `parent value`
  // 2. Using the fuzzy search
  let filteredSpaces = spaces.data;
  if (spaces.filters.parent) {
    filteredSpaces = filterHierarchy(filteredSpaces, spaces.filters.parent);
  }
  if (spaces.filters.search) {
    filteredSpaces = spaceFilter(filteredSpaces, spaces.filters.search);
  }

  // Remove campuses, buildings, and floors before rendering.
  filteredSpaces = filteredSpaces.filter(i => i.spaceType === 'space');


  return <div className="live-space-list">
    {/* Show errors in the spaces collection. */}
    <ErrorBar message={spaces.error} showRefresh />

    {/* Show space count update modal when the flag is set */}
    {activeModal.name === 'update-space-count' ? <SpaceUpdateModal
      space={activeModal.data.space}
      onDismiss={onCloseModal}
      onSubmit={newCount => onResetSpace(activeModal.data.space, newCount)}
    /> : null}

    <div className="live-space-list-container">
      <div className="live-space-list-header">
        <div className="live-space-list-header-hierarchy">
          <SpaceHierarchySelectBox
            className="explore-space-list-space-hierarchy-selector"
            value={spaces.filters.parent ?  spaces.data.find(i => i.id === spaces.filters.parent) : null}
            choices={spaces.data.filter(i => i.spaceType !== 'space')}
            onChange={parent => onSpaceChangeParent(parent ? parent.id : null)}
          />
          <span className="live-space-list-live-indicator-tag">
            {(function(status) {
              switch (status) {
                case CONNECTION_STATES.ERROR:
                  return 'ERROR';
                case CONNECTION_STATES.WAITING_FOR_SOCKET_URL:
                case CONNECTION_STATES.CONNECTING:
                  return 'CONNECTING';
                case CONNECTION_STATES.CONNECTED:
                  return 'LIVE';
                default:
                  return 'OFFLINE';
              }
            })(eventPusherStatus.status)}
            <i className={`status-${eventPusherStatus.status.toLowerCase()}`} />
          </span>
        </div>
        <div className="live-space-list-header-filter">
          <InputBox
            type="text"
            width={250}
            className="live-space-list-search-box"
            placeholder="Filter Spaces ..."
            value={spaces.filters.search}
            onChange={e => onSpaceSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="live-space-list-row">
        {filteredSpaces.map(space => {
          return <div className="live-space-list-item" key={space.id}>
            <SpaceCard
              space={space}
              events={spaces.events[space.id]}
              onClickEditCount={() => onOpenModal('update-space-count', {space})}
              onClickRealtimeChartFullScreen={() => window.location.href = `#/spaces/live/${space.id}` }
            />
          </div>;
        })}
        
        {!spaces.loading && filteredSpaces.length === 0 ? <div className="live-space-list-empty">
          <span>No spaces found.</span>
        </div> : null}
      </div>
    </div>
  </div>;
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    eventPusherStatus: state.eventPusherStatus,
    activeModal: state.activeModal,
  };
}, dispatch => {
  return {
    onSpaceSearch(searchQuery) {
      dispatch(collectionSpacesFilter('search', searchQuery));
    },
    onSpaceChangeParent(parentId) {
      dispatch(collectionSpacesFilter('parent', parentId));
    },
    onResetSpace(space, newCount) {
      dispatch<any>(spaceResetCount(space, newCount)).then(ok => {
        ok && dispatch(hideModal());
      });
    },

    onOpenModal(name, data) {
      dispatch(showModal(name, data));
    },
    onCloseModal() {
      dispatch(hideModal());
    },
  };
})(LiveSpaceList);
