import styles from './styles.module.scss';

import React, { Fragment, useRef } from 'react';
import { connect } from 'react-redux';
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

import { State } from '../../interfaces/global';
import { SpaceReportControlTypes } from '../../interfaces/space-reports';

import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';

import hideModal from '../../actions/modal/hide';
import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';
import collectionAlertsUpdate from '../../actions/collection/alerts/update';

import ExploreAlertPopupList from '../explore-alert-popup-list/index';
import ExploreSpaceTrends from '../explore-space-trends/index';
import ExploreSpaceDaily from '../explore-space-daily/index';
import ExploreSpaceDataExport from '../explore-space-data-export/index';
import ExploreSpaceMeetings from '../explore-space-meetings/index';
import SpacesReportController from '../spaces-report-controller/index';

import ExploreAlertManagementModal from '../explore-alert-management-modal';
import AppBarSubnav, { AppBarSubnavLink } from '../app-bar-subnav';
import SpacePicker, { SelectControlTypes } from '../space-picker';
import { useAutoWidth } from '../../helpers/hooks';

const SPACES_BACKGROUND = '#FAFAFA';

function ExploreSpacePage({ activePage }) {
  switch(activePage) {
    case 'SPACES_SPACE_TRENDS':
      return <ExploreSpaceTrends />;
    case 'SPACES_SPACE_DAILY':
      return <ExploreSpaceDaily />;
    case 'SPACES_SPACE_DATA_EXPORT':
      return <ExploreSpaceDataExport />;
    case 'SPACES_SPACE_MEETINGS':
      return <ExploreSpaceMeetings />;
    default:
      return null;
  }
}

interface SpacesRawProps { };

const mapStateToProps = (state: State, ownProps: {}) => ({
  spaces: state.spaces,
  spaceHierarchy: state.spaceHierarchy,
  spaceReports: state.spaceReports,
  selectedSpace: state.spaces.data.find(d => d.id === state.spaces.selected),
  alerts: state.alerts,
  activePage: state.activePage,
  activeModal: state.activeModal,
  resizeCounter: state.resizeCounter,
});

const mapDispatchToProps = (dispatch: any) => ({
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
});

export function SpacesRaw ({
  spaces,
  spaceHierarchy,
  spaceReports,
  selectedSpace,
  alerts,
  activePage,
  activeModal,
  onUpdateAlert,
  onSpaceSearch,
  onShowModal,
}) {
// } : (
//   SpacesRawProps &
//   ReturnType<typeof mapStateToProps> &
//   ReturnType<typeof mapDispatchToProps>
// )) {
  const ref = useRef(null);
  const width = useAutoWidth(ref);

  let formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy.data);

  if (spaces.filters.search) {
    const matchedSpaceIds = fuzzy.filter<any>(
      spaces.filters.search,
      spaces.data,
      { pre: '<', post: '>', extract: x => x['name'] }
    ).map(x => x.original['id']);
    formattedHierarchy = formattedHierarchy.filter(x => matchedSpaceIds.includes(x.space.id)).filter(x => x);
  }

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
                {formattedHierarchy.length === 0 && spaces.filters.search.length === 0 ?
                  <div className={styles.loadingSpaces}>Loading spaces...</div> :
                  selectedSpace ?
                    <SpacePicker
                      value={formattedHierarchy.find(x => x.space.id === selectedSpace.id) || null}
                      onChange={item => window.location.href = `#/spaces/${item.space.id}/trends`}
                      showSearchBox={false}
                      formattedHierarchy={formattedHierarchy}
                      selectControl={SelectControlTypes.NONE}
                      isItemDisabled={item => {
                        return !spaces.data.find(s => s.id === item.space.id);
                      }}
                    /> :
                    null
                }
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
                    href={`#/spaces/${selectedSpace.id}/trends`}
                    active={activePage === "SPACES_SPACE_TRENDS"}
                  >
                    Trends
                  </AppBarSubnavLink>
                  <AppBarSubnavLink
                    href={`#/spaces/${selectedSpace.id}/daily`}
                    active={activePage === "SPACES_SPACE_DAILY"}
                  >
                    Daily
                  </AppBarSubnavLink>
                  { ["conference_room", "meeting_room"].includes(selectedSpace.function) ? <AppBarSubnavLink
                    href={`#/spaces/${selectedSpace.id}/meetings`}
                    active={activePage === "SPACES_SPACE_MEETINGS"}
                  >
                    Meetings
                  </AppBarSubnavLink> : null }
                  <AppBarSubnavLink
                    href={`#/spaces/${selectedSpace.id}/data-export`}
                    active={activePage === "SPACES_SPACE_DATA_EXPORT"}
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
            <AppScrollView backgroundColor={SPACES_BACKGROUND}>
              {selectedSpace ?
                <SpacesReportController
                  space={selectedSpace}
                  title="Controls"
                  controls={[{
                    key: 'asdf',
                    date: '2018-01-01',
                    controlType: SpaceReportControlTypes.DATE
                  }]}
                  onUpdateControls={(key, value) => {
                    console.log(key, value);
                  }}
                  reports={[]}
                /> : null}
              <ExploreSpacePage activePage={activePage} />
            </AppScrollView>
          </AppPane>
        </AppFrame>
      </div>
    </Fragment>
  );
}

const Spaces = connect(mapStateToProps, mapDispatchToProps)(React.memo(SpacesRaw));

export default Spaces;
