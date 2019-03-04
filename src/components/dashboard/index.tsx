import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import moment from 'moment';

import { connect } from 'react-redux';

import colorVariables from '@density/ui/variables/colors.json';

import {
  AppBar,
  AppBarContext,
  AppBarSection,
  AppBarTitle,
  AppFrame,
  AppPane,
  AppSidebar,
  AppScrollView,
  Button,
  DashboardReportGrid,
  Icons,
} from '@density/ui';
import Toast from '../toast/index';

import { ReportLoading } from '@density/reports';
import Report from '../report';
import DashboardDispatchPopupList from '../dashboard-dispatch-popup-list/index';
import DashboardDispatchManagementModal from '../dashboard-dispatch-management-modal/index';

import stringToBoolean from '../../helpers/string-to-boolean';
import changeDashboardDate from '../../actions/miscellaneous/change-dashboard-date';
import showDashboardSidebar from '../../actions/miscellaneous/show-dashboards-sidebar';
import hideDashboardSidebar from '../../actions/miscellaneous/hide-dashboards-sidebar';
import incrementResizeCounter from '../../actions/miscellaneous/increment-resize-counter';
import routeTransitionDashboardDetail from '../../actions/route-transition/dashboard-detail';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

const DASHBOARD_BACKGROUND = '#F5F5F7';

function DashboardSidebarItem({selected, id, name, reportSet}) {
  const nonHeaderReports = reportSet.filter(i => i.type !== 'HEADER');
  const headerNames = reportSet.filter(i => i.type === 'HEADER').map(i => i.name);
  return (
    <a className="dashboard-app-frame-sidebar-list-item" href={`#/dashboards/${id}`}>
      <div className={classnames('dashboard-sidebar-item', {selected})}>
        <div className="dashboard-sidebar-item-row">
          <span className="dashboard-sidebar-item-name">{name}</span>
          <span className="dashboard-sidebar-item-num-reports">
            {nonHeaderReports.length} {nonHeaderReports.length === 1 ? 'Report' : 'Reports'}
          </span>
          <Icons.ChevronRight width={8} height={8} />
        </div>
        <div className="dashboard-sidebar-item-row">
          <span className="dashboard-sidebar-item-headers">
            {headerNames.length > 0 ? headerNames.join(', ') : "No headers"}
          </span>
        </div>
      </div>
    </a>
  );
}

function DashboardSidebarHideShowIcon({sidebarVisible, onChangeSidebarVisibility}) {
  return (
    <span
      className="dashboard-sidebar-hide-show-icon"
      onClick={() => onChangeSidebarVisibility(!sidebarVisible)}
    >
      <Icons.Menu />
    </span>
  );
}

function DashboardExpandedReportModal({visible, report, reportData, onCloseModal}) {
  return ReactDOM.createPortal(
    (
      <div className={classnames('dashboard-expanded-report-modal', {visible})}>
        <div className="dashboard-expanded-report-modal-inner">
          <AppBarContext.Provider value="TRANSPARENT">
            <AppBar>
              <AppBarSection></AppBarSection>
              <AppBarSection>
                <button onClick={onCloseModal} className="dashboard-expanded-report-modal-button">
                  Close
                </button>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
          {report ? (
            <Report
              report={report as any}
              reportData={reportData as any}
              expanded={true}
            />
          ) : null}
        </div>
      </div>
    ),
    document.body, /* appends to the end of document.body */
  );
}


function DashboardMainScrollViewContent({
  dashboards,
  selectedDashboard,
  resizeCounter,
}) {
  if (dashboards.error) {
    return (
      <div className="dashboard-non-ideal-state">
        <h1>Error loading dashboards</h1>
        <span>{dashboards.error}</span>
      </div>
    );

  } else if (!dashboards.selected && !dashboards.loading) {
    return (
      <div className="dashboard-non-ideal-state">
        <h1>No dashboard selected</h1>
        <span>To create a dashboard, please talk to your Density account manager.</span>
      </div>
    );

  } else if (selectedDashboard && selectedDashboard.reportSet.length === 0) {
    return (
      <div className="dashboard-non-ideal-state">
        <h1>No reports in dashboard</h1>
        <span>To add reports to this dashboard, please talk to your Density account manager.</span>
      </div>
    );

  } else if (selectedDashboard && selectedDashboard.reportSet.length > 0) {
    const nonHeaderReports = selectedDashboard.reportSet.filter(r => r.type !== 'HEADER');
    const loadedReports = nonHeaderReports.filter(
      report => dashboards.calculatedReportData[report.id].state !== 'LOADING'
    );
    const isDashboardLoading = loadedReports.length < nonHeaderReports.length;
    if (isDashboardLoading) {
      return (
        <div className="dashboard-loading-wrapper">
          <div className="dashboard-loading">
            <ReportLoading
              part={loadedReports.length}
              whole={nonHeaderReports.length}
            />
          </div>
        </div>
      );

    } else {
      const reportSections = selectedDashboard.reportSet.reduce((sections, report) => {
        if (report.type === 'HEADER') {
          // Create a new section
          return [ ...sections, {id: report.id, name: report.name, contents: []} ];
        } else {
          // Add report to last existing section
          return [
            ...sections.slice(0, -1),
            {
              ...sections[sections.length-1],
              contents: [...sections[sections.length-1].contents, report],
            },
          ];
        }
      }, [ {id: 'rpt_initial', name: null, contents: []} ]);

      return (
        <div>
          {reportSections.map(({id, name, contents}) => (
            <div key={id} className="dashboard-wrapper">
              {contents.length > 0 ? <div className="dashboard-wrapper-inner">
                {name !== null ? <h1 className="dashboard-header">{name}</h1> : null}
                <div>
                  <DashboardReportGrid
                    reports={[
                      ...contents.map((report, index) => {
                        return {
                          id: `${report.id}-${resizeCounter}`,
                          report: (
                            <Report
                              report={report}
                              reportData={dashboards.calculatedReportData[report.id]}
                              expanded={false}
                            />
                          ),
                        };
                      }),
                    ]}
                  />
                </div>
              </div> : null}

            </div>
          ))}
          <div className="dashboard-app-frame-scroll-body-spacer" />
        </div>
      );
    }
  } else {
    return null;
  }
}

export function Dashboard({
  dashboards,
  selectedDashboard,
  activeModal,

  date,
  sidebarVisible,
  resizeCounter,
  settings,

  onDashboardChangeWeek,
  onChangeSidebarVisibility,
  onCloseModal,
  onShowModal,
}) {
  return (
    <Fragment>
      {/* If an expanded report modal is visible, then render it above the view */}
      {activeModal.name === 'MODAL_REPORT_EXPANDED' ? (
        <DashboardExpandedReportModal
          visible={activeModal.visible}
          report={activeModal.data.report}
          reportData={dashboards.calculatedReportData[activeModal.data.report.id]}
          onCloseModal={onCloseModal}
        />
      ) : null}

      {activeModal.name === 'MODAL_DISPATCH_MANAGEMENT' ? (
        <DashboardDispatchManagementModal
          visible={activeModal.visible}
          selectedDashboard={activeModal.data.selectedDashboard}
          initialDispatchSchedule={activeModal.data.dispatch}
          onCloseModal={onCloseModal}
        />
      ) : null}
      {activeModal.name === 'MODAL_DISPATCH_MANAGEMENT_SUCCESS' ? (
        <div className="dashboard-status-toast">
          <Toast visible={activeModal.visible} onDismiss={onCloseModal}>
            Dispatch saved. Happy reporting!
          </Toast>
        </div>
      ) : null}
      {activeModal.name === 'MODAL_DISPATCH_MANAGEMENT_ERROR' ? (
        <div className="dashboard-status-toast">
          <Toast visible={activeModal.visible} onDismiss={onCloseModal}>
            Error saving digest: {activeModal.data.error.message}
          </Toast>
        </div>
      ) : null}

      {/* Main application */}
      <AppFrame>
        <AppSidebar visible={sidebarVisible}>
          <AppBar><AppBarTitle>Dashboards</AppBarTitle></AppBar>
          <AppScrollView>
            <nav className="dashboard-app-frame-sidebar-list">
              {dashboards.loading ? null :
                <Fragment>
                  {dashboards.data.sort((a, b) => {
                    // Sort alphabetically by name
                    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
                  }).map(dashboard => (
                    <DashboardSidebarItem
                      key={dashboard.id}
                      id={dashboard.id}
                      name={dashboard.name}
                      reportSet={dashboard.reportSet}
                      selected={selectedDashboard ? selectedDashboard.id === dashboard.id : false}
                    />
                  ))}
                </Fragment>}
            </nav>
          </AppScrollView>
        </AppSidebar>
        <AppPane>
          <AppBar>
            <AppBarSection>
              <DashboardSidebarHideShowIcon
                sidebarVisible={sidebarVisible}
                onChangeSidebarVisibility={onChangeSidebarVisibility}
              />
              <AppBarTitle>
                {selectedDashboard ? selectedDashboard.name : ""}
              </AppBarTitle>
            </AppBarSection>

            {/* TODO: Replace this with better report time navigation (like MixPanel) */}
            {settings && stringToBoolean(settings.dashboardWeekScrubber) ? <AppBarSection>
              <div style={{width: 50}}>
                <Button
                  style={{backgroundColor: '#FFF'}}
                  onClick={() => onDashboardChangeWeek(selectedDashboard, -1)}
                >
                  <Icons.ChevronLeft color={colorVariables.brandPrimaryNew} />
                </Button>
              </div>
              <div style={{padding: 13}}>
                Reported on{' '}
                <strong>{moment(date).format('MMMM\u00a0D,\u00a0YYYY')}</strong>
              </div>
              <div style={{width: 50}}>
                <Button
                  style={{backgroundColor: '#FFF'}}
                  onClick={() => onDashboardChangeWeek(selectedDashboard, 1)}
                  disabled={moment(date).add(1, 'week') > moment()}
                >
                  <Icons.ChevronRight
                    color={moment(date).add(1, 'week') > moment() ? 
                      colorVariables.gray :
                      colorVariables.brandPrimaryNew}
                  />
                </Button>
              </div>
            </AppBarSection> : null}

            <AppBarSection>
              <DashboardDispatchPopupList
                dispatches={[
                  /* { */
                  /*   id: 1, */
                  /*   name: 'My dispatch with a really really really long name', */
                  /*   frequency: 'WEEKLY', */
                  /*   frequencyDays: [ */
                  /*     'Monday', */
                  /*     'Tuesday', */
                  /*     'Wednesday', */
                  /*     'Thursday', */
                  /*     'Friday', */
                  /*   ], */
                  /*   recipients: [ */
                  /*     { */
                  /*       id: 'usr_123', */
                  /*       fullName: 'Ryan Gaus', */
                  /*     }, */
                  /*     { */
                  /*       id: 'usr_456', */
                  /*       fullName: 'Robery Grazioli', */
                  /*     }, */
                  /*   ], */
                  /* }, */
                  /* { */
                  /*   id: 2, */
                  /*   name: 'Number two', */
                  /*   frequency: 'MONTHLY', */
                  /*   recipients: [ */
                  /*     { */
                  /*       id: 'usr_789', */
                  /*       fullName: 'Gus Cost', */
                  /*     }, */
                  /*   ], */
                  /* }, */
                ]}
                onEditDispatch={dispatch => {
                  onShowModal('MODAL_DISPATCH_MANAGEMENT', { selectedDashboard, dispatch });
                }}
                onCreateDispatch={() => {
                  onShowModal('MODAL_DISPATCH_MANAGEMENT', { selectedDashboard, dispatch: null });
                }}
              />
            </AppBarSection>
          </AppBar>
          <AppScrollView backgroundColor={DASHBOARD_BACKGROUND}>
            <DashboardMainScrollViewContent
              dashboards={dashboards}
              selectedDashboard={selectedDashboard}
              resizeCounter={resizeCounter}
            />
          </AppScrollView>
        </AppPane>
      </AppFrame>
    </Fragment>
  );
}

export default connect((state: any) => {
  const selectedDashboard = state.dashboards.data.find(d => d.id === state.dashboards.selected);
  return {
    dashboards: state.dashboards,
    selectedDashboard,
    activeModal: state.activeModal,

    date: state.miscellaneous.dashboardDate,
    sidebarVisible: state.miscellaneous.dashboardSidebarVisible,
    resizeCounter: state.resizeCounter,
    settings: state.user.data && state.user.data.organization.settings,
  };
}, (dispatch: any) => {
  return {
    onDashboardChangeWeek(dashboard, weeks) {
      dispatch(changeDashboardDate(weeks));
      dispatch(routeTransitionDashboardDetail(dashboard.id));
    },
    onChangeSidebarVisibility(visibleState) {
      if (visibleState) {
        dispatch(showDashboardSidebar());
      } else {
        dispatch(hideDashboardSidebar());
      }

      // Once the animation has completed, force a relayout
      setTimeout(() => {
        dispatch(incrementResizeCounter());
      }, 300);
    },

    onCloseModal() {
      dispatch(hideModal());
    },
    onShowModal(name, data) {
      dispatch(showModal(name, data));
    },
  };
})(Dashboard);
