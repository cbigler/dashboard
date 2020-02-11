import styles from './styles.module.scss';

import React, { useState, Fragment } from 'react';
import classnames from 'classnames';
import moment from 'moment';

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
} from '@density/ui/src';

import { ReportLoading } from '@density/reports';
import Report, { ExpandedReportModal } from '../report';
import DashboardDigestPopupList from '../dashboard-digest-popup-list/index';
import DashboardDigestManagementModal from '../dashboard-digest-management-modal/index';
import DashboardEmailModal from '../dashboard-email-modal';
import GenericErrorState from '../generic-error-state/index';

import stringToBoolean from '../../helpers/string-to-boolean';
import { scrubDashboardDate } from '../../rx-actions/miscellaneous/set-dashboard-date';
import routeTransitionDashboardDetail from '../../rx-actions/route-transition/dashboard-detail';
import createDashboard from '../../rx-actions/dashboards/create-dashboard';
import { showToast } from '../../rx-actions/toasts';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';
import useRxStore from '../../helpers/use-rx-store';
import UserStore from '../../rx-stores/user';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import ActiveModalStore from '../../rx-stores/active-modal';
import DashboardsStore from '../../rx-stores/dashboards';
import { getSelectedDashboard } from '../../helpers/legacy';
import MiscellaneousStore from '../../rx-stores/miscellaneous';
import ResizeCounterStore from '../../rx-stores/resize-counter';

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

  } else if (selectedDashboard && selectedDashboard.report_set.length === 0) {
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

  } else if (selectedDashboard && selectedDashboard.report_set.length > 0) {
    const nonHeaderReports = selectedDashboard.report_set.filter(r => r.type !== 'HEADER');
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
      const reportSections = selectedDashboard.report_set.reduce((sections, report) => {
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

function DashboardListItem({selected, id, name, report_set, onClick}) {
  const nonHeaderReports = report_set.filter(i => i.type !== 'HEADER');
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
          color={selected ? colorVariables.midnight : colorVariables.gray500}
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
        <div className={styles.dashboardDropdownValue} onClick={() => setOpened(!opened)}>
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
              >Add a dashboard</Button>
            </AppBarSection>
          </AppBar>
          {dashboards.loading ? null : <div className={styles.dashboardDropdownPopupScroll}>
            {dashboards.data.sort((a, b) => {
              // Sort alphabetically by name
              return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
            }).map(dashboard => (
              <DashboardListItem
                key={dashboard.id}
                id={dashboard.id}
                name={dashboard.name}
                report_set={dashboard.report_set}
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

const Dashboard: React.FunctionComponent<{
  dashboards: Any<FixInRefactor>,
  selectedDashboard: Any<FixInRefactor>,
  activeModal: Any<FixInRefactor>,

  date: Any<FixInRefactor>,
  resizeCounter: Any<FixInRefactor>,
  settings: Any<FixInRefactor>,
  isDemoUser: Any<FixInRefactor>,
  isReadOnlyUser: Any<FixInRefactor>,

  onDashboardChangeWeek: Any<FixInRefactor>,
  onCloseModal: Any<FixInRefactor>,
  onShowModal: Any<FixInRefactor>,
  onCreateDashboard: Any<FixInRefactor>,
  onCsvExportError: Any<FixInRefactor>,
}> = function Dashboard(props) {

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
  } = props;

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
      <div className={styles.appFrameWrapper}>
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

                  {selectedDashboard ? (
                    <AppBarSection>
                      {/* TODO: Replace this with better report time navigation (like MixPanel) */}
                      {settings && stringToBoolean(settings.dashboard_week_scrubber) ? 
                        <div className={styles.dashboardWeekScrubberContainer}>
                          <button
                            className={styles.dashboardWeekScrubberControl}
                            onClick={() => onDashboardChangeWeek(selectedDashboard, -1)}>
                            <Icons.ChevronLeft color={colorVariables.brandPrimary}  height={24} width={24}/>
                          </button>
                          <button
                            className={styles.dashboardWeekScrubberControl}
                            onClick={() => onDashboardChangeWeek(selectedDashboard, 1)}
                            disabled={moment(date).add(1, 'week') > moment()}>
                            <Icons.ChevronRight color={moment(date).add(1, 'week') > moment() ? colorVariables.gray : colorVariables.brandPrimary} height={24} width={24}/>
                          </button>
                          <div className={styles.dashboardWeekScrubberLabel}>
                            Reported on: <span className={styles.dashboardWeekScrubberLabelDate}>{moment(date).format('MMMM\u00a0D,\u00a0YYYY')}</span>
                          </div>
                        </div>
                      : null}
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
                        <Button href={`#/dashboards/${selectedDashboard.id}/edit`}>Edit dashboard</Button>
                      ) : null}
                    </AppBarSection>
                  ) : null}
                </AppBar>
              </AppBarContext.Provider>
            ) : null}
            <AppScrollView backgroundColor={colorVariables.gray000}>
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

// FIXME: apparently there are additional external props 
const ConnectedDashboard: React.FC<Any<FixInRefactor>> = (externalProps) => {
  const dispatch = useRxDispatch();

  const userState = useRxStore(UserStore) as Any<FixInRefactor>;
  const activeModal = useRxStore(ActiveModalStore);
  const dashboards = useRxStore(DashboardsStore);
  const miscellaneous = useRxStore(MiscellaneousStore);
  const resizeCounter = useRxStore(ResizeCounterStore);

  const selectedDashboard = getSelectedDashboard(dashboards);

  // formerly mapStateToProps
  const isDemoUser = userState && userState.data && userState.data.is_demo;
  const isReadOnlyUser = userState && userState.data && !userState.data.permissions.includes('core_write');
  const settings = userState && userState.data && userState.data.organization.settings;
  const date = miscellaneous.dashboardDate;
  const sidebarVisible = miscellaneous.dashboardSidebarVisible;

  // formerly mapDispatchToProps
  const onCsvExportError = () => {
    showToast(dispatch, { type: 'error', text: 'Error exporting CSV' });
  }
  const onCloseModal = () => {
    hideModal(dispatch);
  }
  const onShowModal = (name, data) => {
    showModal(dispatch, name, data);
  }
  const onDashboardChangeWeek = async (dashboard, weeks) => {
    dispatch(scrubDashboardDate(weeks) as Any<FixInRefactor>);
    await routeTransitionDashboardDetail(dispatch, dashboard.id);
  }
  const onCreateDashboard = async () => {
    await createDashboard(dispatch);
  }
  return (
    <Dashboard

      {...externalProps}

      dashboards={dashboards}
      selectedDashboard={selectedDashboard}

      activeModal={activeModal}
      resizeCounter={resizeCounter}

      isDemoUser={isDemoUser}
      isReadOnlyUser={isReadOnlyUser}
      settings={settings}
      date={date}
      sidebarVisible={sidebarVisible}

      onCloseModal={onCloseModal}
      onShowModal={onShowModal}
      onCsvExportError={onCsvExportError}
      onDashboardChangeWeek={onDashboardChangeWeek}
      onCreateDashboard={onCreateDashboard}
    />
  )
}
export default ConnectedDashboard;
