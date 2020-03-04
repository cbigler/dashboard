import React from 'react';
import classnames from 'classnames';
import ErrorBar from '../error-bar/index';

import collectionSpacesFilter from '../../rx-actions/collection/spaces-legacy/filter';
import spaceResetCount from '../../rx-actions/collection/spaces-legacy/reset-count';
import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';

import { InputBox } from '@density/ui/src';
import SpaceCard from '../live-space-card/index';
import EditCountModal from '../edit-count-modal/index';

import { CONNECTION_STATES } from '../../helpers/websocket-event-pusher/index';

import SpaceHierarchySelectBox from '../space-hierarchy-select-box/index';

import styles from './styles.module.scss';

import { getParentsOfSpace } from '../../helpers/filter-hierarchy/index';
import filterCollection from '../../helpers/filter-collection/index';
import autoRefresh from '../../helpers/auto-refresh-hoc';
import { isDocumentHidden } from '../../helpers/visibility-change';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore, { ActiveModalState } from '../../rx-stores/active-modal';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import SpacesLegacyStore, { SpacesLegacyState } from '../../rx-stores/spaces-legacy';
import EventPusherStatusStore, { EventPusherStatusState } from '../../rx-stores/event-pusher-status';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
const spaceFilter = filterCollection({fields: ['name']});

function filterHierarchy(spaces: Array<CoreSpace>, parent_id: string) {
  return spaces.filter(space => {
    return (
      space.doorways.length !== 0 && /* must have doorways */
      getParentsOfSpace(spaces, space).indexOf(parent_id) > 0 /* index 0 = current space */
    );
  });
}

export function LiveSpaceList({
  spaces,
  activeModal,
  eventPusherStatus,

  onSpaceSearch,
  onSpaceChangeParent,
  onResetSpace,
  onOpenModal,
  onCloseModal,
}: {
  spaces: SpacesLegacyState,
  activeModal: ActiveModalState,
  eventPusherStatus: EventPusherStatusState,
  onSpaceSearch: (searchQuery: string) => void,
  onSpaceChangeParent: (parent_id: string) => void,
  onResetSpace: (space: CoreSpace, newCount: number) => Promise<void>,
  onOpenModal: (name: Any<FixInRefactor>, data: Any<FixInRefactor>) => void,
  onCloseModal: () => Promise<void>,
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

  // Remove any spaces that don't have doorways
  filteredSpaces = filteredSpaces.filter(i => i.doorways.length !== 0);


  return <div className={styles.liveSpaceList}>
    {/* Show errors in the spaces collection. */}
    <ErrorBar message={spaces.error} showRefresh />

    {/* Show space count update modal when the flag is set */}
    {activeModal.name === 'update-space-count' ? <EditCountModal
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
            choices={spaces.data.filter(i => i.space_type !== 'space')}
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
  shouldComponentUpdate: () => !isDocumentHidden()
})(LiveSpaceList);


const ConnectedAutoRefreshedLiveSpaceList: React.FC = () => {

  const dispatch = useRxDispatch();
  const activeModal = useRxStore(ActiveModalStore);
  const spaces = useRxStore(SpacesLegacyStore);
  const eventPusherStatus = useRxStore(EventPusherStatusStore);

  const onResetSpace = async (space: CoreSpace, newCount: number) => {
    const ok = await spaceResetCount(dispatch, space, newCount);
    if (ok) { hideModal(dispatch); }
  }
  const onOpenModal = (name, data) => {
    showModal(dispatch, name, data);
  }
  const onCloseModal = async () => {
    await hideModal(dispatch);
  }
  const onSpaceSearch = (searchQuery: string) => {
    dispatch(collectionSpacesFilter('search', searchQuery) as Any<FixInRefactor>);
  }
  const onSpaceChangeParent = (parent_id: string) => {
    dispatch(collectionSpacesFilter('parent', parent_id) as Any<FixInRefactor>);
  }

  return (
    <AutoRefreshedLiveSpaceList
      spaces={spaces}
      activeModal={activeModal}
      eventPusherStatus={eventPusherStatus}
      onSpaceSearch={onSpaceSearch}
      onSpaceChangeParent={onSpaceChangeParent}
      onResetSpace={onResetSpace}
      onOpenModal={onOpenModal}
      onCloseModal={onCloseModal}
    />
  )
}

export default ConnectedAutoRefreshedLiveSpaceList;
