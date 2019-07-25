import styles from './styles.module.scss';

import React, { Fragment, useRef } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import fuzzy from 'fuzzy';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppFrame,
  AppPane,
  AppSidebar,
  AppScrollView,
  Icons,
  InputBox,
} from '@density/ui';

import sortSpaceTree from '../../helpers/sort-space-tree/index';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';
import ExploreAlertPopupList from '../explore-alert-popup-list/index';
import ExploreSpaceTrends from '../explore-space-trends/index';
import ExploreSpaceDaily from '../explore-space-daily/index';
import ExploreSpaceDataExport from '../explore-space-data-export/index';
import ExploreSpaceMeetings from '../explore-space-meetings/index';
import ExploreControlBar from '../explore-control-bar';
import hideModal from '../../actions/modal/hide';
import showModal from '../../actions/modal/show';
import ExploreAlertManagementModal from '../explore-alert-management-modal';
import AppBarSubnav, { AppBarSubnavLink } from '../app-bar-subnav';
import collectionAlertsUpdate from '../../actions/collection/alerts/update';
import showToast from '../../actions/toasts';
import { useAutoWidth } from '../../helpers/hooks';

const EXPLORE_BACKGROUND = '#FAFAFA';


function ExploreSidebarItemRaw({spaces, space, activePage, selectedSpace, depth}) {
  const id = space.id;
  const name = space.name;
  const spaceType = space.spaceType;
  const selected = selectedSpace ? selectedSpace.id === space.id : false;
  const enabled = !!spaces.data.find(x => x.id === space.id && x.doorways.length > 0);

  let page;
  switch(activePage) {
    case 'EXPLORE_SPACE_TRENDS':
      page = "trends";
      break;
    case 'EXPLORE_SPACE_DAILY':
      page = "daily";
      break;
    case 'EXPLORE_SPACE_DATA_EXPORT':
      page = "data-export";
      break;
    case 'EXPLORE_SPACE_MEETINGS':
      page = "meetings";
      break;
    default:
      page = "trends";
      break;
  }

  let icon;
  switch(spaceType) {
    case 'campus':
      icon = "";
      break;
    case 'building':
      icon = <Icons.Building />;
      break;
    case 'floor':
      icon = <Icons.Folder />;
      break;
    case 'space':
      icon = <Icons.L />;
      break;
    default:
      icon = "";
      break;
  }

  return (
    <div key={space.id} className={styles[`${space.spaceType}Container`]}>
      {enabled ?
        <a className={classnames(styles.exploreAppFrameSidebarListItem, styles[spaceType])} href={`#/spaces/explore/${id}/${page}`}>
          <div className={classnames(styles.exploreSidebarItem, {[styles.selected]: selected})}>
            <div className={styles.exploreSidebarItemRow}>
              {icon}
              <span className={styles.exploreSidebarItemName}>{name}</span>
            </div>
          </div>
        </a> :
        <div className={classnames(
          styles.exploreAppFrameSidebarListItem,
          styles.disabled,
          styles[spaceType]
        )}>
          <div className={classnames(styles.exploreSidebarItem, {[styles.selected]: selected})}>
            <div className={styles.exploreSidebarItemRow}>
              {icon}
              <span className={styles.exploreSidebarItemName}>{name}</span>
            </div>
          </div>
        </div> 
      }
      {space.children && space.children.map(space => (
        <ExploreSidebarItemRaw
          spaces={spaces}
          space={space}
          activePage={activePage}
          selectedSpace={selectedSpace}
          depth={depth+1} />
      ))}
    </div>
  )
}

const ExploreSidebarItem = React.memo(ExploreSidebarItemRaw);

function ExploreSpacePage({ activePage }) {
  switch(activePage) {
    case 'EXPLORE_SPACE_TRENDS':
      return <ExploreSpaceTrends />;
    case 'EXPLORE_SPACE_DAILY':
      return <ExploreSpaceDaily />;
    case 'EXPLORE_SPACE_DATA_EXPORT':
      return <ExploreSpaceDataExport />;
    case 'EXPLORE_SPACE_MEETINGS':
      return <ExploreSpaceMeetings />;
    default:
      return null;
  }
}

function pruneHierarchy(spaceTree, matchedSpaceIds) {
  if (spaceTree.children) {
    spaceTree.children = spaceTree.children.map(x => {
      return pruneHierarchy(x, matchedSpaceIds);
    }).filter(x => x);
  }
  if (
    (spaceTree.children && spaceTree.children.length > 0) ||
    matchedSpaceIds.indexOf(spaceTree.id) > -1
  ) {
    return spaceTree;
  } else {
    return null;
  }
}

export function ExploreRaw ({
  spaces,
  spaceHierarchy,
  selectedSpace,
  alerts,
  activePage,
  activeModal,
  onUpdateAlert,
  onSpaceSearch,
  onShowModal,
}: any) {
  const ref = useRef(null);
  const width = useAutoWidth(ref);

  let filteredSpaces = spaceHierarchy.data;
  if (spaces.filters.search) {
    const matchedSpaceIds = fuzzy.filter<any>(
      spaces.filters.search,
      spaces.data,
      { pre: '<', post: '>', extract: x => x['name'] }
    ).map(x => x.original['id']);
    const filteredSpacesCopy = JSON.parse(JSON.stringify(filteredSpaces));
    filteredSpaces = filteredSpacesCopy.map(x => pruneHierarchy(x, matchedSpaceIds)).filter(x => x);
  }

  const spaceList = sortSpaceTree(filteredSpaces);
  return (
    <Fragment>

      {/* If an expanded report modal is visible, then render it above the view */}
      {activeModal.name === 'MODAL_ALERT_MANAGEMENT' ? (
        <ExploreAlertManagementModal />
      ) : null}

      {/* Main application */}
      <div ref={ref} className={styles.appFrameWrapper}>
        <AppFrame>
          <AppSidebar visible={true} width={width <= 1120 ? 280 : 328}>
            <AppBar>
              <InputBox
                type="text"
                width="100%"
                placeholder="Filter spaces ..."
                disabled={false}
                leftIcon={<Icons.Search />}
                value={spaces.filters.search}
                onChange={e => onSpaceSearch(e.target.value)}
              />
            </AppBar>
            <AppScrollView>
              <nav className={styles.exploreAppFrameSidebarList}>
                  <Fragment>
                    {spaceList.length === 0 && spaces.filters.search.length === 0 ? <div className={styles.loadingSpaces}>Loading spaces...</div> : null}
                    {spaceList.map(space => (
                      <ExploreSidebarItem
                        spaces={spaces}
                        space={space}
                        activePage={activePage}
                        selectedSpace={selectedSpace}
                        depth={0} />
                    ))}
                  </Fragment>
              </nav>
            </AppScrollView>
          </AppSidebar>
          <AppPane>
            <AppBar>
              <AppBarSection>
                <AppBarTitle>{(selectedSpace && selectedSpace.name) || ""}</AppBarTitle>
              </AppBarSection>
              {selectedSpace ? <AppBarSection>
                <AppBarSubnav>
                  <AppBarSubnavLink
                    href={`#/spaces/explore/${selectedSpace.id}/trends`}
                    active={activePage === "EXPLORE_SPACE_TRENDS"}
                  >
                    Trends
                  </AppBarSubnavLink>
                  <AppBarSubnavLink
                    href={`#/spaces/explore/${selectedSpace.id}/daily`}
                    active={activePage === "EXPLORE_SPACE_DAILY"}
                  >
                    Daily
                  </AppBarSubnavLink>
                  { ["conference_room", "meeting_room"].includes(selectedSpace.function) ? <AppBarSubnavLink
                    href={`#/spaces/explore/${selectedSpace.id}/meetings`}
                    active={activePage === "EXPLORE_SPACE_MEETINGS"}
                  >
                    Meetings
                  </AppBarSubnavLink> : null }
                  <AppBarSubnavLink
                    href={`#/spaces/explore/${selectedSpace.id}/data-export`}
                    active={activePage === "EXPLORE_SPACE_DATA_EXPORT"}
                  >
                    Data Export
                  </AppBarSubnavLink>
                </AppBarSubnav>
              </AppBarSection> : null}
              <AppBarSection>
                <ExploreAlertPopupList
                  alerts={alerts}
                  selectedSpace={selectedSpace}
                  onCreateAlert={() => {
                    onShowModal('MODAL_ALERT_MANAGEMENT', {
                      alert: {
                        spaceId: selectedSpace.id,
                        enabled: true,
                        isOneShot: true,
                        notificationType: 'sms',
                        triggerValue: (selectedSpace && selectedSpace.capacity) || 50,
                        triggerType: 'greater_than',
                        cooldown: -1,
                        meta: {
                          toNum: '',
                          escalationDelta: null,
                        }
                      }
                    });
                  }}
                  onEditAlert={alert => {
                    onShowModal('MODAL_ALERT_MANAGEMENT', { alert: { meta: {}, ...alert } });
                  }}
                  onToggleAlert={(alert, enabled) => {
                    onUpdateAlert({...alert, enabled});
                  }}
                />
              </AppBarSection>
            </AppBar>
            <ExploreControlBar
              selectedSpace={selectedSpace}
              spaceHierarchy={spaceHierarchy}
              activePage={activePage}
              filters={spaces.filters}
            />
            <AppScrollView backgroundColor={EXPLORE_BACKGROUND}>
              <ExploreSpacePage activePage={activePage} />
            </AppScrollView>
          </AppPane>
        </AppFrame>
      </div>
    </Fragment>
  );
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    spaceHierarchy: state.spaceHierarchy,
    selectedSpace: state.spaces.data.find(d => d.id === state.spaces.selected),
    alerts: state.alerts,
    activePage: state.activePage,
    activeModal: state.activeModal,
    resizeCounter: state.resizeCounter,
  };
}, (dispatch: any) => {
  return {
    onSpaceSearch(searchQuery) {
      dispatch(collectionSpacesFilter('search', searchQuery));
    },
    async onUpdateAlert(alert) {
      await dispatch(collectionAlertsUpdate(alert));
      dispatch(showToast({
        text: alert.enabled ? 'Alert enabled' : 'Alert disabled',
        timeout: 1000
      }));
    },
    onShowModal(name, data) {
      dispatch(showModal(name, data));
    },
    onCloseModal() {
      dispatch(hideModal());
    },
  };
})(React.memo(ExploreRaw));
