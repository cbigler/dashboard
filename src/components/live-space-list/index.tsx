import React from 'react';
import classnames from 'classnames';
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

import styles from './styles.module.scss';

import { getParentsOfSpace } from '../../helpers/filter-hierarchy/index';
import filterCollection from '../../helpers/filter-collection/index';
import autoRefresh from '../../helpers/auto-refresh-hoc';
import { isDocumentHidden } from '../../helpers/visibility-change';
const spaceFilter = filterCollection({fields: ['name']});

function filterHierarchy(spaces, parentId) {
  return spaces.filter(space => {
    return (
      space.spaceType === 'space' && /* must be of type space */
      getParentsOfSpace(spaces, space).indexOf(parentId) > 0 /* index 0 = current space */
    );
  });
}

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


  return <div className={styles.liveSpaceList}>
    {/* Show errors in the spaces collection. */}
    <ErrorBar message={spaces.error} showRefresh />

    {/* Show space count update modal when the flag is set */}
    {activeModal.name === 'update-space-count' ? <SpaceUpdateModal
      visible={activeModal.visible}
      space={activeModal.data.space}
      onDismiss={onCloseModal}
      onSubmit={newCount => onResetSpace(activeModal.data.space, newCount)}
    /> : null}

    <div className={styles.liveSpaceListContainer}>
      <div className={styles.liveSpaceListHeader}>
        <div className={styles.liveSpaceListHeaderHierarchy}>
          <SpaceHierarchySelectBox
            value={spaces.filters.parent ?  spaces.data.find(i => i.id === spaces.filters.parent) : null}
            choices={spaces.data.filter(i => i.spaceType !== 'space')}
            onChange={parent => onSpaceChangeParent(parent ? parent.id : null)}
          />
          <span className={styles.liveSpaceListLiveIndicatorTag}>
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
            <i className={classnames(styles.status, styles[eventPusherStatus.status.toLowerCase()])} />
          </span>
        </div>
        <div className={styles.liveSpaceListHeaderFilter}>
          <InputBox
            type="text"
            width={250}
            className={styles.liveSpaceListSearchBox}
            placeholder="Filter spaces ..."
            value={spaces.filters.search}
            onChange={e => onSpaceSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.liveSpaceListRow}>
        {filteredSpaces.map(space => {
          return <div className={styles.liveSpaceListItem} key={space.id}>
            <SpaceCard
              space={space}
              events={spaces.events[space.id]}
              onClickEditCount={() => onOpenModal('update-space-count', {space})}
              onClickRealtimeChartFullScreen={() => window.location.href = `#/spaces/live/${space.id}` }
            />
          </div>;
        })}
        
        {!spaces.loading && filteredSpaces.length === 0 ? <div className={styles.liveSpaceListEmpty}>
          <span>No spaces found.</span>
        </div> : null}
      </div>
    </div>
  </div>;
}

const AutoRefreshedLiveSpaceList = autoRefresh({
  shouldComponentUpdate: !isDocumentHidden()
})(LiveSpaceList);

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
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },

    onOpenModal(name, data) {
      dispatch<any>(showModal(name, data));
    },
    onCloseModal() {
      dispatch<any>(hideModal());
    },
  };
})(AutoRefreshedLiveSpaceList);
