import styles from './styles.module.scss';

import React, { Fragment, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

import { AppState } from '../../interfaces/global';

import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';

import showModal from '../../actions/modal/show';
import showToast from '../../actions/toasts';
import collectionSpacesFilter from '../../actions/collection/spaces/filter';
import collectionAlertsUpdate from '../../actions/collection/alerts/update';

import ExploreAlertPopupList from '../explore-alert-popup-list/index';
import ExploreSpaceDaily from '../explore-space-daily/index';
import ExploreSpaceDataExport from '../explore-space-data-export/index';
import SpacesReportController from '../spaces-report-controller/index';

import ExploreAlertManagementModal from '../explore-alert-management-modal';
import AppBarSubnav, { AppBarSubnavLink } from '../app-bar-subnav';
import SpacePicker, { SelectControlTypes } from '../space-picker';
import { useAutoWidth } from '../../helpers/use-auto-width';
import ExploreControlBar from '../explore-control-bar';
import spacesUpdateReportController from '../../actions/space-reports/update-report-controller';
import spaceReportsCalculateReportData from '../../actions/space-reports/calculate-report-data';
import { ExpandedReportModal } from '../report';
import hideModal from '../../actions/modal/hide';

export const SPACES_BACKGROUND = '#FAFAFA';

function ExploreSpacePage({ activePage }) {
  switch(activePage) {
    case 'SPACES_SPACE_DAILY':
      return <ExploreSpaceDaily />;
    case 'SPACES_SPACE_DATA_EXPORT':
      return <ExploreSpaceDataExport />;
    default:
      return null;
  }
}

export function SpacesRaw () {
  const dispatch = useDispatch();
  const {
    spaces,
    spaceHierarchy,
    spaceReports,
    selectedSpace,
    alerts,
    activePage,
    activeModal,
    //resizeCounter,
  } = useSelector((state: AppState) => ({
    spaces: state.spaces,
    spaceHierarchy: state.spaceHierarchy,
    spaceReports: state.spaceReports,
    selectedSpace: state.spaces.data.find(d => d.id === state.spaces.selected),
    alerts: state.alerts,
    activePage: state.activePage,
    activeModal: state.activeModal,
    resizeCounter: state.resizeCounter,
  }));

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

      {/* If an expanded report modal is visible, then render it above the view */}
      {activeModal.name === 'MODAL_REPORT_EXPANDED' ? (
          <ExpandedReportModal
            visible={activeModal.visible}
            report={activeModal.data.report}
            reportData={activeModal.data.reportData}
            onCloseModal={() => dispatch(hideModal())}
          />
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
                onChange={e => {
                  dispatch(collectionSpacesFilter('search', e.target.value));
                }}
              />
            </AppBar>
            <AppScrollView>
              <nav className={styles.exploreAppFrameSidebarList}>
                {formattedHierarchy.length === 0 && !spaces.filters.search ?
                  <div className={styles.loadingSpaces}>Loading spaces...</div> :
                  selectedSpace ?
                    <SpacePicker
                      value={formattedHierarchy.find(x => x.space.id === selectedSpace.id) || null}
                      onChange={item => window.location.href = `#/spaces/${item.space.id}/trends`}
                      showSearchBox={false}
                      formattedHierarchy={formattedHierarchy}
                      selectControl={SelectControlTypes.NONE}
                      isItemDisabled={item => {
                        const space = spaces.data.find(s => s.id === item.space.id);
                        return !space || !space.doorways.length;
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
                    dispatch(showModal('MODAL_ALERT_MANAGEMENT', {
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
                    }));
                  }}
                  onEditAlert={alert => {
                    dispatch(showModal('MODAL_ALERT_MANAGEMENT', {
                      alert: { meta: {}, ...alert }
                    }));
                  }}
                  onToggleAlert={async (alert, enabled) => {
                    const updated = {...alert, enabled};
                    await dispatch(collectionAlertsUpdate(updated));
                    dispatch(showToast({
                      text: enabled ? 'Alert enabled' : 'Alert disabled',
                      timeout: 1000
                    }));
                  }}
                />
              </AppBarSection>
            </AppBar>
            
            {/* New controller for trends page */}
            {activePage === 'SPACES_SPACE_TRENDS' && selectedSpace ?
              spaceReports.controllers.filter(x => x.key === 'trends_page_controller').map(controller => (
                <SpacesReportController
                  key={controller.key}
                  space={selectedSpace}
                  spaceHierarchy={spaceHierarchy.data}
                  controller={controller}
                  onUpdateControls={(key, value) => {
                    const updated = {
                      ...controller,
                      controls: controller.controls.map(control => {
                        return control.key === key ? {...control, ...value} : control;
                      })
                    };
                    dispatch(spacesUpdateReportController(selectedSpace, updated));
                    dispatch(spaceReportsCalculateReportData(updated, selectedSpace));
                  }}
                />
              )) : null}

            {/* New controller for meetings page */}
            {activePage === 'SPACES_SPACE_MEETINGS' && selectedSpace ?
              spaceReports.controllers.filter(x => x.key === 'meetings_page_controller').map(controller => (
                <SpacesReportController
                  key={controller.key}
                  space={selectedSpace}
                  spaceHierarchy={spaceHierarchy.data}
                  controller={controller}
                  onUpdateControls={(key, value) => {
                    const updated = {
                      ...controller,
                      controls: controller.controls.map(control => {
                        return control.key === key ? {...control, ...value} : control;
                      })
                    };
                    dispatch(spacesUpdateReportController(selectedSpace, updated));
                    dispatch(spaceReportsCalculateReportData(updated, selectedSpace));
                  }}
                />
              )) : null}

            {/* Old components for other pages */}
            {['SPACES_SPACE_DAILY', 'SPACES_SPACE_DATA_EXPORT'].indexOf(activePage) > -1 ?
              <Fragment>
                <ExploreControlBar
                  selectedSpace={selectedSpace}
                  spaceHierarchy={spaceHierarchy}
                  activePage={activePage}
                  filters={spaces.filters}
                />
                <AppScrollView backgroundColor={SPACES_BACKGROUND}>
                  <ExploreSpacePage activePage={activePage} /> 
                </AppScrollView>
              </Fragment> : null}

          </AppPane>
        </AppFrame>
      </div>
    </Fragment>
  );
}

export default React.memo(SpacesRaw);