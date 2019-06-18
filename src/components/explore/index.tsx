import styles from './styles.module.scss';

import React, { Fragment } from 'react';
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
  Modal,
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

const EXPLORE_BACKGROUND = '#FAFAFA';


function ExploreSidebarItem({selected, enabled, id, name, spaceType, activePage}) {
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

  if (enabled) {
    return (
      <a className={classnames(styles.exploreAppFrameSidebarListItem, styles[spaceType])} href={`#/spaces/explore/${id}/${page}`}>
        <div className={classnames(styles.exploreSidebarItem, {[styles.selected]: selected})}>
          <div className={styles.exploreSidebarItemRow}>
            {icon}
            <span className={styles.exploreSidebarItemName}>{name}</span>
          </div>
        </div>
      </a>
    );
  } else {
    return (
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
    );
  }
}

function RenderExploreSidebarItem(spaces, space, activePage, selectedSpace, depth) {
  return (
    <div key={space.id} className={styles[`${space.spaceType}Container`]}>
      <ExploreSidebarItem
        id={space.id}
        name={space.name}
        spaceType={space.spaceType}
        activePage={activePage}
        selected={selectedSpace ? selectedSpace.id === space.id : false}
        enabled={!!spaces.data.find(x => x.id === space.id && x.doorways.length > 0)}
      />
      {space.children && space.children.map(space => (
        RenderExploreSidebarItem(spaces, space, activePage, selectedSpace, depth+1)
      ))}
    </div>
  )
}

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

export class Explore extends React.Component<any, any> {
  private pageContainerRef: React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);
    this.pageContainerRef = React.createRef();
    this.state = {
      pageSize: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    if (this.pageContainerRef) {
      const div: any = this.pageContainerRef.current;
      this.setState({
        pageSize: div.clientWidth,
      });
    }
  }

  render() {
    const {
      spaces,
      spaceHierarchy,
      selectedSpace,
      activePage,
      activeModal,
      onSpaceSearch,
      onShowModal,
      onCloseModal,
    } = this.props;

    const sidebarWidth = this.state.pageSize <= 1120 ? 280 : 280;

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
          <ExploreAlertManagementModal
            visible={activeModal.visible}
            selectedSpace={activeModal.data.selectedSpace}
            alert={activeModal.data.alert}
            onCloseModal={onCloseModal}
          />
        ) : null}

        {/* Main application */}
        <div ref={this.pageContainerRef} className={styles.appFrameWrapper}>
          <AppFrame>
            <AppSidebar visible={true} width={sidebarWidth}>
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
                        RenderExploreSidebarItem(spaces, space, activePage, selectedSpace, 0)
                      ))}
                    </Fragment>
                </nav>
              </AppScrollView>
            </AppSidebar>
            <AppPane>
              <AppBar>
                <AppBarSection>
                  <AppBarTitle>{selectedSpace ? selectedSpace.name : ""}</AppBarTitle>
                </AppBarSection>
                <AppBarSection>
                  <ExploreAlertPopupList
                    selectedSpace={selectedSpace}
                    onCreateAlert={() => {
                      onShowModal('MODAL_ALERT_MANAGEMENT', { selectedSpace, alert: null });
                    }}
                    onEditAlert={a => {
                      onShowModal('MODAL_ALERT_MANAGEMENT', { selectedSpace, alert: a });
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
}

export default connect((state: any) => {
  return {
    spaces: state.spaces,
    spaceHierarchy: state.spaceHierarchy,
    selectedSpace: state.spaces.data.find(d => d.id === state.spaces.selected),
    activePage: state.activePage,
    activeModal: state.activeModal,
  };
}, (dispatch: any) => {
  return {
    onSpaceSearch(searchQuery) {
      dispatch(collectionSpacesFilter('search', searchQuery));
    },
    onCloseModal() {
      dispatch(hideModal());
    },
    onShowModal(name, data) {
      dispatch(showModal(name, data));
    },
  };
})(Explore);
