import styles from './styles.module.scss';

import React, { Fragment, useRef } from 'react';
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
} from '@density/ui/src';

import { spaceHierarchyFormatter } from '@density/lib-space-helpers';

import collectionSpacesFilter from '../../rx-actions/collection/spaces/filter';

import AlertPopupList from '../alert-popup-list/index';
import ExploreSpaceDaily from '../explore-space-daily/index';
import ExploreSpaceDataExport from '../explore-space-data-export/index';
import SpacesReportController from '../spaces-report-controller/index';

import AlertManagementModal from '../alert-management-modal';
import AppBarSubnav, { AppBarSubnavLink } from '../app-bar-subnav';
import SpacePicker, { SelectControlTypes } from '../space-picker';
import { useAutoWidth } from '../../helpers/use-auto-width';
import ExploreControlBar from '../explore-control-bar';
import spacesUpdateReportController from '../../rx-actions/space-reports/update-report-controller';
import spaceReportsCalculateReportData from '../../rx-actions/space-reports/calculate-report-data';
import { ExpandedReportModal } from '../report';
import hideModal from '../../rx-actions/modal/hide';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore from '../../rx-stores/active-modal';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import ActivePageStore from '../../rx-stores/active-page';
import SpacesStore from '../../rx-stores/spaces';
import SpaceHierarchyStore from '../../rx-stores/space-hierarchy';
import SpaceReportsStore from '../../rx-stores/space-reports';
// import ResizeCounterStore from '../../rx-stores/resize-counter';

export const SPACES_BACKGROUND = '#FAFAFA';

function hasMeetingsPage(space) {
  return ['conference_room', 'meeting_room'].includes(space.function);
}

function getHashRoute(space, activePage) {
  switch(activePage) {
    case 'SPACES_SPACE_TRENDS':
      return `#/spaces/${space.id}/trends`;
    case 'SPACES_SPACE_DAILY':
      return `#/spaces/${space.id}/daily`;
    case 'SPACES_SPACE_DATA_EXPORT':
      return `#/spaces/${space.id}/data-export`;
    case 'SPACES_SPACE_MEETINGS':
      return hasMeetingsPage(space) ?
        `#/spaces/${space.id}/meetings` :
        `#/spaces/${space.id}/trends`;
    default:
      return `#/spaces/${space.id}/trends`;
  }
}

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

export function SpacesRaw ({
  spaces,
  spaceHierarchy,
  spaceReports,
  selectedSpace,
  activePage,
  activeModal,
  //resizeCounter,
  onCloseModal,
  onFilterSpaces,
  onUpdateReportController,
  onCalculateReportData,
}) {
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
        <AlertManagementModal />
      ) : null}

      {/* If an expanded report modal is visible, then render it above the view */}
      {activeModal.name === 'MODAL_REPORT_EXPANDED' ? (
          <ExpandedReportModal
            visible={activeModal.visible}
            report={activeModal.data.report}
            reportData={activeModal.data.reportData}
            onCloseModal={onCloseModal}
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
                onChange={onFilterSpaces}
              />
            </AppBar>
            <AppScrollView>
              <nav className={styles.exploreAppFrameSidebarList}>
                {formattedHierarchy.length === 0 && !spaces.filters.search ?
                  <div className={styles.loadingSpaces}>Loading spaces...</div> :
                  selectedSpace ?
                    <SpacePicker
                      value={formattedHierarchy.find(x => x.space.id === selectedSpace.id) || null}
                      showSearchBox={false}
                      formattedHierarchy={formattedHierarchy}
                      selectControl={SelectControlTypes.NONE}
                      onChange={item => {
                        const space = spaces.data.find(s => s.id === item.space.id);
                        window.location.href = getHashRoute(space, activePage);
                      }}
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
                    active={activePage === 'SPACES_SPACE_TRENDS'}
                  >
                    Trends
                  </AppBarSubnavLink>
                  <AppBarSubnavLink
                    href={`#/spaces/${selectedSpace.id}/daily`}
                    active={activePage === 'SPACES_SPACE_DAILY'}
                  >
                    Daily
                  </AppBarSubnavLink>
                  { hasMeetingsPage(selectedSpace) ? <AppBarSubnavLink
                    href={`#/spaces/${selectedSpace.id}/meetings`}
                    active={activePage === 'SPACES_SPACE_MEETINGS'}
                  >
                    Meetings
                  </AppBarSubnavLink> : null }
                  <AppBarSubnavLink
                    href={`#/spaces/${selectedSpace.id}/data-export`}
                    active={activePage === 'SPACES_SPACE_DATA_EXPORT'}
                  >
                    Data Export
                  </AppBarSubnavLink>
                </AppBarSubnav>
              </AppBarSection> : null}
              <AppBarSection>
                <AlertPopupList selectedSpace={selectedSpace} />
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
                    onUpdateReportController(selectedSpace, updated);
                    onCalculateReportData(selectedSpace, updated);
                  }}
                />
              )) : null}

            {/* New controller for meetings page */}
            {activePage === 'SPACES_SPACE_MEETINGS' && selectedSpace ?
              spaceReports.controllers.filter(x => x.key === 'meetings_page_controller').map(controller => (
                (selectedSpace.spaceMappings || []).length ?
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
                      onUpdateReportController(selectedSpace, updated);
                      onCalculateReportData(selectedSpace, updated);
                    }}
                  /> :
                  <div style={{ width: '100%', height: '100%', background: SPACES_BACKGROUND }}>
                    <div className={styles.centeredMessage}>
                      <div className={styles.roomBookingMessage}>
                        <span>
                          Please set up a{' '}
                          <a href="#/admin/integrations">room booking integration</a>
                          {' '}to view meeting data for this space.
                        </span>
                      </div>
                    </div>
                  </div>
                  
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


const ConnectedSpaces: React.FC = () => {

  const dispatch = useRxDispatch();
  const activePage = useRxStore(ActivePageStore);
  const activeModal = useRxStore(ActiveModalStore);
  const spaces = useRxStore(SpacesStore);
  const spaceHierarchy = useRxStore(SpaceHierarchyStore);
  const spaceReports = useRxStore(SpaceReportsStore);
  // const resizeCounter = useRxStore(ResizeCounterStore);

  // FIXME: This could probably just be handled by the spaces store
  const selectedSpace = spaces.data.find(d => d.id === spaces.selected);

  const onCloseModal = async () => {
    await hideModal(dispatch)
  }

  const onFilterSpaces = (e) => {
    dispatch(collectionSpacesFilter('search', e.target.value) as Any<FixInRefactor>)
  }
  const onUpdateReportController = (selectedSpace, updated) => {
    dispatch(spacesUpdateReportController(selectedSpace, updated) as Any<FixInRefactor>)
  }
  const onCalculateReportData = async (selectedSpace, updated) => (
    await spaceReportsCalculateReportData(dispatch, updated, selectedSpace)
  )

  return (
    <SpacesRaw
      activePage={activePage}
      activeModal={activeModal}
      // resizeCounter={resizeCounter}
      onCloseModal={onCloseModal}
      spaces={spaces}
      spaceHierarchy={spaceHierarchy}
      spaceReports={spaceReports}
      selectedSpace={selectedSpace}
      onFilterSpaces={onFilterSpaces}
      onUpdateReportController={onUpdateReportController}
      onCalculateReportData={onCalculateReportData}
    />
  )
}

export default ConnectedSpaces;
