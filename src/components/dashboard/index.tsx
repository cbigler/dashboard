import styles from './styles.module.scss';

import React, { useState, Fragment } from 'react';
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
  AppScrollView,
  Button,
  DashboardReportGrid,
  Icons,
} from '@density/ui';

import { ReportLoading } from '@density/reports';
import Report, { ExpandedReportModal } from '../report';
import DashboardDigestPopupList from '../dashboard-digest-popup-list/index';
import DashboardDigestManagementModal from '../dashboard-digest-management-modal/index';
import DashboardEmailModal from '../dashboard-email-modal';
import GenericErrorState from '../generic-error-state/index';

import stringToBoolean from '../../helpers/string-to-boolean';
import { scrubDashboardDate } from '../../actions/miscellaneous/set-dashboard-date';
import routeTransitionDashboardDetail from '../../actions/route-transition/dashboard-detail';
import createDashboard from '../../actions/dashboards/create-dashboard';
import showToast from '../../actions/toasts';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

function DashboardMainScrollViewContent({
  dashboards,
  selectedDashboard,
  resizeCounter,
  isReadOnlyUser,
  onCsvExportError,
}) {
  if (!dashboards.selected && !dashboards.loading) {
    return (
      <div className={styles.dashboardNonIdealState}>
        <h1>Dashboard not found</h1>
        <span>This dashboard was not found - it may not exist, or was deleted.</span>
      </div>
    );

  } else if (selectedDashboard && selectedDashboard.reportSet.length === 0) {
    return (
      <div className={styles.dashboardEmptyState}>
        <h3>
          <img src="https://densityco.github.io/assets/images/wave.dfbfe264.png" alt="" />
          Welcome!
        </h3>
        <p>Dashboards are a convenient way for you to see the space and data you’re interested in.</p>
        {!isReadOnlyUser ? (
          <Button href={`#/dashboards/${selectedDashboard.id}/edit`}>Edit dashboard</Button>
        ) : null}
      </div>
    );

  } else if (dashboards.error) {
    return (
      <div className={styles.dashboardNonIdealState}>
        <GenericErrorState />
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
                              onCsvExportError={onCsvExportError}
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

function DashboardListItem({selected, id, name, reportSet, onClick}) {
  const nonHeaderReports = reportSet.filter(i => i.type !== 'HEADER');
  return (
    <a
      className={styles.dashboardListItemLink}
      href={`#/dashboards/${id}`}
      onClick={onClick}
    >
      <div className={classnames(styles.dashboardListItem, {[styles.selected]: selected})}>
        <span className={styles.dashboardListItemName}>{name}</span>
        <span className={styles.dashboardListItemNumReports}>
          {nonHeaderReports.length} {nonHeaderReports.length === 1 ? 'Report' : 'Reports'}
        </span>
        <Icons.ChevronRight
          color={selected ? colorVariables.brandPrimary : colorVariables.grayDarker}
          width={16}
          height={16}
        />
      </div>
    </a>
  );
}

function DashboardDropdown({selectedDashboard, dashboards, onCreateDashboard}) {
  const [opened, setOpened] = useState(false);
  return (
    <Fragment>
      <div
        className={classnames(styles.dashboardDropdownBackdrop, {[styles.visible]: opened})}
        onClick={() => setOpened(false)}
      />
      <div className={styles.dashboardDropdownWrapper}>
        <div
          data-label="dashboard-dropdown"
          className={styles.dashboardDropdownValue}
          onClick={() => setOpened(!opened)}
        >
          <AppBarTitle>
            <span className={styles.dashboardDropdownName}>
              {selectedDashboard ? selectedDashboard.name : ""}
            </span>
            <Icons.ChevronDown />
          </AppBarTitle>
        </div>

        <div className={classnames(styles.dashboardDropdownPopup, {[styles.visible]: opened})}>
          <AppBar>
            <AppBarTitle>Dashboards</AppBarTitle>
            <AppBarSection>
              <Button
                onClick={() => {
                  setOpened(false);
                  onCreateDashboard();
                }}
                data-label="dashboard-add"
              >Add a dashboard</Button>
            </AppBarSection>
          </AppBar>
          {dashboards.loading ? null : <div className={styles.dashboardDropdownPopupScroll} data-label="dashboard-list">
            {dashboards.data.sort((a, b) => {
              // Sort alphabetically by name
              return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            }).map(dashboard => (
              <DashboardListItem
                key={dashboard.id}
                id={dashboard.id}
                name={dashboard.name}
                reportSet={dashboard.reportSet}
                selected={selectedDashboard ? selectedDashboard.id === dashboard.id : false}
                onClick={() => setOpened(false)}
              />
            ))}
          </div>}
        </div>
      </div>
    </Fragment>
  )
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
      dashboards,
      selectedDashboard,
      activeModal,

      date,
      resizeCounter,
      settings,
      isDemoUser,
      isReadOnlyUser,

      onDashboardChangeWeek,
      onCloseModal,
      onShowModal,
      onCreateDashboard,
      onCsvExportError,
    } = this.props;

    return (
      <Fragment>
        {/* If an expanded report modal is visible, then render it above the view */}
        {activeModal.name === 'MODAL_REPORT_EXPANDED' ? (
          <ExpandedReportModal
            visible={activeModal.visible}
            report={activeModal.data.report}
            reportData={activeModal.data.reportData}
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

        {activeModal.name === 'MODAL_DASHBOARD_EMAIL' ? (
          <DashboardEmailModal
            visible={activeModal.visible}
            selectedDashboard={activeModal.data.selectedDashboard}
            onCloseModal={onCloseModal}
          />
        ) : null}

        {/* Main application */}
        <div ref={this.pageContainerRef} className={styles.appFrameWrapper}>
          <AppFrame>
            <AppPane>
              {selectedDashboard || dashboards.loading ? (
                <AppBarContext.Provider value="CARD_HEADER">
                  <AppBar>
                    {selectedDashboard ? (
                      <AppBarSection>
                        <DashboardDropdown
                          selectedDashboard={selectedDashboard}
                          dashboards={dashboards}
                          onCreateDashboard={onCreateDashboard}
                        />
                      </AppBarSection>
                    ) : null}

                    {/* TODO: Replace this with better report time navigation (like MixPanel) */}
                    {settings && stringToBoolean(settings.dashboardWeekScrubber) ? <AppBarSection>
                      <div style={{width: 58}}>
                        <Button onClick={() => onDashboardChangeWeek(selectedDashboard, -1)}>
                        <div style={{paddingTop: 6, paddingLeft: 1}}>
                          <Icons.ChevronLeft color={colorVariables.brandPrimary} />
                        </div>
                        </Button>
                      </div>
                      <div style={{padding: 13}}>
                        Reported on{' '}
                        <strong>{moment(date).format('MMMM\u00a0D,\u00a0YYYY')}</strong>
                      </div>
                      <div style={{width: 58}}>
                        <Button
                          onClick={() => onDashboardChangeWeek(selectedDashboard, 1)}
                          disabled={moment(date).add(1, 'week') > moment()}
                        >
                          <div style={{paddingTop: 6, paddingLeft: 1}}>
                            <Icons.ChevronRight
                              color={moment(date).add(1, 'week') > moment() ?
                                colorVariables.gray :
                                colorVariables.brandPrimary}
                            />
                          </div>
                        </Button>
                      </div>
                    </AppBarSection> : null}

                    {selectedDashboard ? (
                      <AppBarSection>
                        {!isDemoUser && !isReadOnlyUser ? (
                          <DashboardDigestPopupList
                            selectedDashboard={selectedDashboard}
                            onEditDigest={digest => {
                              onShowModal('MODAL_DIGEST_MANAGEMENT', { selectedDashboard, digest });
                            }}
                            onCreateDigest={() => {
                              onShowModal('MODAL_DIGEST_MANAGEMENT', { selectedDashboard, digest: null });
                            }}
                            onCreateEmail={() => {
                              onShowModal('MODAL_DASHBOARD_EMAIL', { selectedDashboard })
                            }}
                          />
                        ) : null}
                        {!isReadOnlyUser ? (
                          <Button
                            href={`#/dashboards/${selectedDashboard.id}/edit`}
                            data-label="dashboard-edit"
                          >Edit dashboard</Button>
                        ) : null}
                      </AppBarSection>
                    ) : null}
                  </AppBar>
                </AppBarContext.Provider>
              ) : null}
              <AppScrollView backgroundColor={colorVariables.grayLightest}>
                <DashboardMainScrollViewContent
                  dashboards={dashboards}
                  selectedDashboard={selectedDashboard}
                  resizeCounter={resizeCounter}
                  isReadOnlyUser={isReadOnlyUser}
                  onCsvExportError={onCsvExportError}
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
    isReadOnlyUser: state.user && state.user.data && !state.user.data.permissions.includes('core_write'),

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
    onCreateDashboard() {
      dispatch(createDashboard());
    },

    onCloseModal() {
      dispatch(hideModal());
    },
    onShowModal(name, data) {
      dispatch(showModal(name, data));
    },
    onCsvExportError() {
      dispatch(showToast({ type: 'error', text: 'Error exporting CSV' }));
    },
  };
})(Dashboard);
