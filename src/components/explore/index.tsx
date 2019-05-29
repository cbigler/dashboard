import styles from './styles.module.scss';

import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import fuzzy from 'fuzzy';

import {
  AppBar,
  AppBarTitle,
  AppFrame,
  AppPane,
  AppSidebar,
  AppScrollView,
  Icons,
  InputBox,
} from '@density/ui';

import AppBarSubnav, { AppBarSubnavLink } from '../app-bar-subnav';

import filterCollection from '../../helpers/filter-collection/index';
import sortSpaceTree from '../../helpers/sort-space-tree/index';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';
import ExploreSpaceTrends from '../explore-space-trends/index';
import ExploreSpaceDaily from '../explore-space-daily/index';
import ExploreSpaceDataExport from '../explore-space-data-export/index';
import ExploreSpaceMeetings from '../explore-space-meetings/index';

const EXPLORE_BACKGROUND = '#FAFAFA';
const spaceFilter = filterCollection({fields: ['name']});


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
      onSpaceSearch,
    } = this.props;

    const sidebarWidth = this.state.pageSize <= 1120 ? 280 : 415;

    let filteredSpaces = spaceHierarchy.data;
    if (spaces.filters.search) {
      const matchedSpaceIds = fuzzy.filter(
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
        {/* Main application */}
        <div ref={this.pageContainerRef}>
          <AppFrame>
            <AppSidebar visible={true} width={sidebarWidth}>
              <AppBar>
                <InputBox
                  type="text"
                  width="100%"
                  placeholder="Filter Spaces ..."
                  disabled={false}
                  leftIcon={<Icons.Search />}
                  value={spaces.filters.search}
                  onChange={e => onSpaceSearch(e.target.value)}
                />
              </AppBar>
              <AppScrollView>
                <nav className={styles.exploreAppFrameSidebarList}>
                    <Fragment>
                      {spaceList.length == 0 && spaces.filters.search.length == 0 ? <div className={styles.loadingSpaces}>Loading Spaces...</div> : null}
                      {spaceList.map(space => (
                        RenderExploreSidebarItem(spaces, space, activePage, selectedSpace, 0)
                      ))}
                    </Fragment>
                </nav>
              </AppScrollView>
            </AppSidebar>
            <AppPane>
              <AppBar>
                <AppBarTitle>{selectedSpace ? selectedSpace.name : ""}</AppBarTitle>
                { selectedSpace ?
                <AppBarSubnav>
                  <AppBarSubnavLink
                    href={`#/spaces/explore/${spaces.selected}/trends`}
                    active={activePage === "EXPLORE_SPACE_TRENDS"}
                  >
                    Trends
                  </AppBarSubnavLink>
                  <AppBarSubnavLink
                    href={`#/spaces/explore/${spaces.selected}/daily`}
                    active={activePage === "EXPLORE_SPACE_DAILY"}
                  >
                    Daily
                  </AppBarSubnavLink>
                  { ["conference_room", "meeting_room"].includes(selectedSpace['function']) ? <AppBarSubnavLink
                    href={`#/spaces/explore/${spaces.selected}/meetings`}
                    active={activePage === "EXPLORE_SPACE_MEETINGS"}
                  >
                    Meetings
                  </AppBarSubnavLink> : null }
                  <AppBarSubnavLink
                    href={`#/spaces/explore/${spaces.selected}/data-export`}
                    active={activePage === "EXPLORE_SPACE_DATA_EXPORT"}
                  >
                    Data Export
                  </AppBarSubnavLink>
                </AppBarSubnav> : null}
              </AppBar>
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
  const selectedSpace = state.spaces.data.find(d => d.id === state.spaces.selected);
  return {
    spaces: state.spaces,
    spaceHierarchy: state.spaceHierarchy,
    selectedSpace
  };
}, dispatch => {
  return {
    onSpaceSearch(searchQuery) {
      dispatch(collectionSpacesFilter('search', searchQuery));
    },
  };
})(Explore);
