import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';

import { connect } from 'react-redux';

import DashboardReportGrid from '@density/ui-dashboard-report-grid';

import ReportLoading from '@density/ui-report-loading';

import AppBar from '@density/ui-app-bar';
import AppFrame from '@density/ui-app-frame';
import AppPane from '@density/ui-app-pane';
import AppSidebar from '@density/ui-app-sidebar';
import AppScrollView from '@density/ui-app-scroll-view';
import AppBarTransparent from '../app-bar-transparent/index';
import Report from '../report';
import { IconMenu, IconChevronRight } from '@density/ui-icons';

import showDashboardSidebar from '../../actions/miscellaneous/show-dashboards-sidebar';
import hideDashboardSidebar from '../../actions/miscellaneous/hide-dashboards-sidebar';
import resetDashboardReportGridIdentityValue from '../../actions/miscellaneous/reset-dashboard-report-grid-identity-value';

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
          <IconChevronRight width={8} height={8} />
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
      <IconMenu />
    </span>
  );
}

function DashboardExpandedReportModal({visible, report, reportData, onCloseModal}) {
  return ReactDOM.createPortal(
    (
      <div className={classnames('dashboard-expanded-report-modal', {visible})}>
        <div className="dashboard-expanded-report-modal-inner">
          <AppBarTransparent
            rightSpan={(
              <button onClick={onCloseModal} className="dashboard-expanded-report-modal-button">
                Close
              </button>
            )}
          />
          {report ? (
            <Report
              report={report as any}
              reportData={reportData as any}
              expanded={true}
            />
          ) : null}
          <AppBarTransparent />
        </div>
      </div>
    ),
    document.body, /* appends to the end of document.body */
  );
}



function DashboardMainScrollViewContent({
  dashboards,
  selectedDashboard,
  dashboardReportGridIdentityValue,
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
                          id: `${report.id}-${dashboardReportGridIdentityValue}`,
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
  dashboardReportGridIdentityValue,
  activeModal,

  sidebarVisible,
  onChangeSidebarVisibility,
  onCloseModal,
}) {
  const reportExpandedModalVisible = (activeModal.name === 'MODAL_REPORT_EXPANDED');
  return (
    <Fragment>
      {/* If an expanded report modal is visible, then render it above the view */}
      <DashboardExpandedReportModal
        visible={reportExpandedModalVisible}
        report={activeModal.data.report}
        reportData={reportExpandedModalVisible ?
          dashboards.calculatedReportData[activeModal.data.report.id] : null}
        onCloseModal={onCloseModal}
      />

      {/* Main application */}
      <AppFrame>
        <AppSidebar visible={sidebarVisible}>
          <AppBar title="Dashboards" />
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
          <AppBar
            leftSpan={<DashboardSidebarHideShowIcon
              sidebarVisible={sidebarVisible}
              onChangeSidebarVisibility={onChangeSidebarVisibility}
            />}
            title={selectedDashboard ? selectedDashboard.name : ""} />
          <AppScrollView backgroundColor={DASHBOARD_BACKGROUND}>
            <DashboardMainScrollViewContent
              dashboards={dashboards}
              selectedDashboard={selectedDashboard}
              dashboardReportGridIdentityValue={dashboardReportGridIdentityValue}
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

    sidebarVisible: state.miscellaneous.dashboardSidebarVisible,
    dashboardReportGridIdentityValue: state.miscellaneous.dashboardReportGridIdentityValue,
  };
}, dispatch => {
  return {
    onChangeSidebarVisibility(visibleState) {
      if (visibleState) {
        dispatch(showDashboardSidebar());
      } else {
        dispatch(hideDashboardSidebar());
      }

      // Once the animation has completed, force a relayout
      setTimeout(() => {
        dispatch(resetDashboardReportGridIdentityValue());
      }, 300);
    },

    onCloseModal() {
      dispatch(hideModal());
    },
  };
})(Dashboard);
