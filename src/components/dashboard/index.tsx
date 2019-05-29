import styles from './styles.module.scss';

import React, { Fragment } from 'react';
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
  Modal,
} from '@density/ui';

import { ReportLoading } from '@density/reports';
import Report from '../report';
import DashboardDigestPopupList from '../dashboard-digest-popup-list/index';
import DashboardDigestManagementModal from '../dashboard-digest-management-modal/index';

import stringToBoolean from '../../helpers/string-to-boolean';
import { scrubDashboardDate } from '../../actions/miscellaneous/set-dashboard-date';
import showDashboardSidebar from '../../actions/miscellaneous/show-dashboards-sidebar';
import hideDashboardSidebar from '../../actions/miscellaneous/hide-dashboards-sidebar';
import incrementResizeCounter from '../../actions/miscellaneous/increment-resize-counter';
import routeTransitionDashboardDetail from '../../actions/route-transition/dashboard-detail';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

function DashboardSidebarItem({selected, id, name, reportSet}) {
  const nonHeaderReports = reportSet.filter(i => i.type !== 'HEADER');
  return (
    <a className={styles.dashboardAppFrameSidebarListItem} href={`#/dashboards/${id}`}>
      <div className={classnames(styles.dashboardSidebarItem, {[styles.selected]: selected})}>
        <span className={styles.dashboardSidebarItemName}>{name}</span>
        <span className={styles.dashboardSidebarItemNumReports}>
          {nonHeaderReports.length} {nonHeaderReports.length === 1 ? 'Report' : 'Reports'}
        </span>
        <Icons.ChevronRight
          color={selected ? colorVariables.brandPrimary : colorVariables.grayDarker}
          width={8}
          height={8}
        />
      </div>
    </a>
  );
}

function DashboardSidebarHideShowIcon({sidebarVisible, onChangeSidebarVisibility}) {
  return (
    <span
      className={styles.dashboardSidebarHideShowIcon}
      onClick={() => onChangeSidebarVisibility(!sidebarVisible)}
    >
      <Icons.Menu />
    </span>
  );
}

function DashboardExpandedReportModal({visible, report, reportData, onCloseModal}) {
  return <Modal
    visible={visible}
    onBlur={onCloseModal}
    onEscape={onCloseModal}
    width={1000}
  >
    <div style={{marginTop: -64}}>
      <AppBarContext.Provider value="TRANSPARENT">
        <AppBar padding="0">
          <AppBarSection></AppBarSection>
          <AppBarSection>
            <Button onClick={onCloseModal}>Close</Button>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </div>
    {report ? <Report
      report={report as any}
      reportData={reportData as any}
      expanded={true}
    /> : null}
  </Modal>
}


function DashboardMainScrollViewContent({
  dashboards,
  selectedDashboard,
  resizeCounter,
}) {
  if (dashboards.error) {
    return (
      <div className={styles.dashboardNonIdealState}>
        <h1>Error loading dashboards</h1>
        <span>{dashboards.error}</span>
      </div>
    );

  } else if (!dashboards.selected && !dashboards.loading) {
    return (
      <div className={styles.dashboardNonIdealState}>
        <h1>No dashboard selected</h1>
        <span>To create a dashboard, please talk to your Density account manager.</span>
      </div>
    );

  } else if (selectedDashboard && selectedDashboard.reportSet.length === 0) {
    return (
      <div className={styles.dashboardNonIdealState}>
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
        <div className={styles.dashboardLoadingWrapper}>
          <div className={styles.dashboardLoading}>
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
            <div key={id} className={styles.dashboardWrapper}>
              {contents.length > 0 ? <div className={styles.dashboardWrapperInner}>
                {name !== null ? <h1 className={styles.dashboardHeader}>{name}</h1> : null}
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
          <div className={styles.dashboardAppFrameScrollBodySpacer} />
        </div>
      );
    }
  } else {
    return null;
  }
}

export class Dashboard extends React.Component<any, any> {
  private pageContainerRef: React.RefObject<HTMLInputElement>;

  constructor(props) {
    super(props);
    this.pageContainerRef = React.createRef();
    this.state = {
      pageSize: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize.bind(this));
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    if (this.pageContainerRef) {
      const div: any = this.pageContainerRef.current;
      this.setState({
        pageSize: div.clientWidth,
      });
    }
  }

  render() {
    const {
      dashboards,
      selectedDashboard,
      activeModal,

      date,
      sidebarVisible,
      resizeCounter,
      settings,
      isDemoUser,

      onDashboardChangeWeek,
      onChangeSidebarVisibility,
      onCloseModal,
      onShowModal,
    } = this.props;

    const sidebarWidth = this.state.pageSize <= 1120 ? 280 : 415;

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

        {activeModal.name === 'MODAL_DIGEST_MANAGEMENT' ? (
          <DashboardDigestManagementModal
            visible={activeModal.visible}
            selectedDashboard={activeModal.data.selectedDashboard}
            initialDigestSchedule={activeModal.data.digest}
            onCloseModal={onCloseModal}
          />
        ) : null}

        {/* Main application */}
        <div ref={this.pageContainerRef}>
          <AppFrame>
            <AppSidebar visible={sidebarVisible} width={sidebarWidth}>
              <AppBar><AppBarTitle>Dashboards</AppBarTitle></AppBar>
              <AppScrollView>
                <nav className={styles.dashboardAppFrameSidebarList}>
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
                    <Button onClick={() => onDashboardChangeWeek(selectedDashboard, -1)}>
                    <div style={{paddingTop: 4}}>
                      <Icons.ChevronLeft color={colorVariables.brandPrimaryNew} />
                    </div>
                    </Button>
                  </div>
                  <div style={{padding: 13}}>
                    Reported on{' '}
                    <strong>{moment(date).format('MMMM\u00a0D,\u00a0YYYY')}</strong>
                  </div>
                  <div style={{width: 50}}>
                    <Button
                      onClick={() => onDashboardChangeWeek(selectedDashboard, 1)}
                      disabled={moment(date).add(1, 'week') > moment()}
                    >
                      <div style={{paddingTop: 4}}>
                        <Icons.ChevronRight
                          color={moment(date).add(1, 'week') > moment() ?
                            colorVariables.gray :
                            colorVariables.brandPrimaryNew}
                        />
                      </div>
                    </Button>
                  </div>
                </AppBarSection> : null}

                <AppBarSection>
                  {!isDemoUser ? (
                    <DashboardDigestPopupList
                      selectedDashboard={selectedDashboard}
                      onEditDigest={digest => {
                        onShowModal('MODAL_DIGEST_MANAGEMENT', { selectedDashboard, digest });
                      }}
                      onCreateDigest={() => {
                        onShowModal('MODAL_DIGEST_MANAGEMENT', { selectedDashboard, digest: null });
                      }}
                    />
                  ) : null}
                </AppBarSection>
              </AppBar>
              <AppScrollView backgroundColor={colorVariables.grayLightest}>
                <DashboardMainScrollViewContent
                  dashboards={dashboards}
                  selectedDashboard={selectedDashboard}
                  resizeCounter={resizeCounter}
                />
              </AppScrollView>
            </AppPane>
          </AppFrame>
        </div>
      </Fragment>
    );
  }
}

export default connect((state: any) => {
  const selectedDashboard = state.dashboards.data.find(d => d.id === state.dashboards.selected);
  return {
    dashboards: state.dashboards,
    selectedDashboard,
    activeModal: state.activeModal,

    isDemoUser: state.user && state.user.data && state.user.data.isDemo,

    date: state.miscellaneous.dashboardDate,
    sidebarVisible: state.miscellaneous.dashboardSidebarVisible,
    resizeCounter: state.resizeCounter,
    settings: state.user.data && state.user.data.organization.settings,
  };
}, (dispatch: any) => {
  return {
    onDashboardChangeWeek(dashboard, weeks) {
      dispatch(scrubDashboardDate(weeks));
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
