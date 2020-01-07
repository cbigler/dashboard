import React, { Fragment } from 'react';
import styles from './styles.module.scss';
import { REPORTS } from '@density/reports';

import showModal from '../../rx-actions/modal/show';
import dashboardsUpdateFormState from '../../rx-actions/dashboards/update-form-state';
import dashboardsUpdate from '../../rx-actions/dashboards/update';
import dashboardsDestroy from '../../rx-actions/dashboards/destroy';
import { showToast } from '../../rx-actions/toasts';

import GenericLoadingState from '../generic-loading-state';
import GenericErrorState from '../generic-error-state';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';

import {
  openReportModal,
  closeReportModal,

  PAGE_PICK_SAVED_REPORT,
  PAGE_NEW_REPORT_CONFIGURATION,
  PAGE_NEW_REPORT_TYPE,

  OPERATION_CREATE,
  OPERATION_UPDATE,

  extractCalculatedReportDataFromDashboardsReducer,
} from '../../rx-actions/dashboards/report-modal';
import reportCreate from '../../rx-actions/dashboards/report-create';
import reportUpdate from '../../rx-actions/dashboards/report-update';
import reportDelete from '../../rx-actions/dashboards/report-delete';


import {
  AppFrame,
  AppPane,
  AppBar,
  AppBarTitle,
  AppBarSection,
  Button,
  ButtonGroup,
  Icons,
  InputBox,
  ListView,
  ListViewColumn,
  ListViewColumnSpacer,
} from '@density/ui/src';
import colorVariables from '@density/ui/variables/colors.json';
import DetailModule from '../admin-locations-detail-modules';
import FormLabel from '../form-label';

import DashboardReportEditModal from '../dashboard-report-edit-modal';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore from '../../rx-stores/active-modal';
import UserStore from '../../rx-stores/user';
import { getUserDashboardWeekStart } from '../../helpers/legacy';
import DashboardsStore from '../../rx-stores/dashboards';
import MiscellaneousStore from '../../rx-stores/miscellaneous';
import SpaceHierarchyStore from '../../rx-stores/space-hierarchy';
import useRxDispatch from '../../helpers/use-rx-dispatch';

export function DashboardEdit({
  activeModal,
  selectedDashboard,
  spaceHierarchy,
  dashboards,
  dashboardDate,
  dashboardWeekStart,
  calculatedReportDataForPreviewedReport,

  onUpdateFormState,
  onRelativeReportMove,
  onSaveDashboard,
  onShowDeleteConfirm,
  onRemoveReportFromDashboard,

  onCreateReport,
  onAddExistingReport,
  onCloseModal,
  onEditReport,
  onSaveReportModal,
  onReportShowDeletePopup,
}) {
  return (
    <Fragment>
      <DashboardReportEditModal
        onCloseModal={onCloseModal}
        onAddReportToDashboard={report => {
          onUpdateFormState('reportSet', [ ...dashboards.formState.reportSet, report ]);
          onCloseModal();
          mixpanelTrack('Report Added to Dashboard', {
            report_id: report.id,
            dashboard_id: selectedDashboard.id,
            dashboard_name: selectedDashboard.name,
            report_name: report.name,
            report_type: report.type,
          });
        }}
        onReportShowDeletePopup={report => onReportShowDeletePopup(dashboards.formState, report)}
        onRemoveReportFromDashboard={report => onRemoveReportFromDashboard(dashboards.formState, report)}

        onSaveReportModal={report => onSaveReportModal(dashboards.formState, report)}
      />

      {dashboards.view === 'LOADING' ? (
        <div className={styles.centered}>
          <GenericLoadingState />
        </div>
      ) : null}

      {dashboards.view === 'ERROR' ? (
        <div className={styles.centered}>
          <GenericErrorState />
        </div>
      ) : null}

      {dashboards.view === 'VISIBLE' && selectedDashboard ? (
        <AppFrame>
          <AppPane>
            <AppBar>
              <AppBarTitle>
                <a className={styles.backArrow} href={`#/dashboards/${selectedDashboard.id}`}>
                  <Icons.ArrowLeft />
                </a>
                Edit {selectedDashboard.name}
              </AppBarTitle>
              <AppBarSection>
                <ButtonGroup>
                  <Button variant="underline" href={`#/dashboards/${selectedDashboard.id}`}>Cancel</Button>
                  <Button
                    variant="filled"
                    onClick={() => onSaveDashboard(dashboards.formState)}
                  >Save</Button>
                </ButtonGroup>
              </AppBarSection>
            </AppBar>
            <div className={styles.dashboardEdit}>
              <div className={styles.dashboardEditModuleWrapper}>
                <DetailModule title="General Info">
                  <FormLabel
                    label="Name"
                    htmlFor="dashboards-name"
                    input={<InputBox
                      type="text"
                      id="dashboards-name"
                      width="100%"
                      value={dashboards.formState.name || ''}
                      onChange={e => onUpdateFormState('name', e.target.value)}
                    />}
                  />
                </DetailModule>
              </div>
              <div className={styles.dashboardEditModuleWrapper}>
                <DetailModule title="Reports" actions={(
                  <AppBarSection>
                    <ButtonGroup>
                      <Button onClick={() => onAddExistingReport(dashboardDate, dashboardWeekStart)}>
                        Add saved report
                      </Button>
                      <Button variant="filled" onClick={() => onCreateReport(dashboardDate, dashboardWeekStart)}>
                        Create new report
                      </Button>
                    </ButtonGroup>
                  </AppBarSection>
                )}>
                  {dashboards.formState.reportSet.length === 0 ? (
                    <p>There are no reports in this dashboard.</p>
                  ) : (
                    <ListView data={dashboards.formState.reportSet}>
                      <ListViewColumn
                        id="Name"
                        width={240}
                        template={item => (
                          <Fragment>
                            <Icons.Report color={colorVariables.grayDark} />
                            <span className={styles.name}>
                              {item.name}
                            </span>
                          </Fragment>
                        )}
                      />
                      <ListViewColumn
                        id="Report Type"
                        width={240}
                        template={item => {
                          if (item.type === 'HEADER') {
                            return 'Header';
                          } else {
                            return REPORTS[item.type] ? REPORTS[item.type].metadata.displayName : item.type;
                          }
                        }}
                      />
                      <ListViewColumnSpacer />
                      <ListViewColumn
                        width={100}
                        template={item => (
                          <ButtonGroup>
                            <Button
                              onClick={() => onRelativeReportMove(dashboards.formState, item, -1)}
                              disabled={item.id === dashboards.formState.reportSet[0].id}
                              width={40}
                              height={40}
                              size="small"
                            >
                              <Icons.ArrowUp width={12} height={12} />
                            </Button>
                            <Button
                              onClick={() => onRelativeReportMove(dashboards.formState, item, 1)}
                              disabled={item.id === dashboards.formState.reportSet[dashboards.formState.reportSet.length-1].id}
                              width={40}
                              height={40}
                              size="small"
                            >
                              <Icons.ArrowDown width={12} height={12} />
                            </Button>
                          </ButtonGroup>
                        )}
                      />
                      <ListViewColumn
                        width={60}
                        align="right"
                        template={item => (
                          <ButtonGroup>
                            <Button
                              variant="underline"
                              onClick={() => onEditReport(item, dashboardDate, dashboardWeekStart)}
                            >Edit</Button>
                          </ButtonGroup>
                        )}
                      />
                    </ListView>
                  )}
                </DetailModule>
              </div>
              <div className={styles.dashboardEditModuleWrapper}>
                <DetailModule title="Danger Zone" error>
                  <div className={styles.dangerZoneWrapper}>
                    <div className={styles.dangerZoneLeft}>
                      <h4>Delete this dashboard</h4>
                      <span>Once deleted, it will be gone forever. Please be certain.</span>
                    </div>
                    <div className={styles.dangerZoneRight}>
                      <Button
                        variant="underline"
                        type="danger"
                        onClick={() => onShowDeleteConfirm(selectedDashboard)}
                      >Delete this dashboard</Button>
                    </div>
                  </div>
                </DetailModule>
              </div>
            </div>
          </AppPane>
        </AppFrame>
      ) : null}
    </Fragment>
  );
}


const ConnectedDashboardEdit: React.FC = () => {

  const dispatch = useRxDispatch();
  const activeModal = useRxStore(ActiveModalStore);
  const dashboards = useRxStore(DashboardsStore);
  const user = useRxStore(UserStore);
  const spaceHierarchy = useRxStore(SpaceHierarchyStore);

  const miscellaneous = useRxStore(MiscellaneousStore);

  const dashboardDate = miscellaneous.dashboardDate;

  const dashboardWeekStart = getUserDashboardWeekStart(user);
  // FIXME: this seems kinda convoluted for this...
  const selectedDashboard = dashboards.data.find(d => d.id === dashboards.selected)
  const calculatedReportDataForPreviewedReport = extractCalculatedReportDataFromDashboardsReducer(dashboards);


  // formerly mapDispatchToProps
  const onCloseModal = async () => {
    await closeReportModal(dispatch);
  }
  const onUpdateFormState = (key, value) => {
    dispatch(dashboardsUpdateFormState(key, value) as Any<FixInRefactor>);
  }
  const onRelativeReportMove = (formState, report, relativeMove) => {
    const reportIndex = formState.reportSet.findIndex(r => r.id === report.id);
    if (reportIndex === -1) { return; }

    const reportSet = formState.reportSet.slice();
    // Move the report `relativeMove` places in the report set array
    reportSet.splice(reportIndex, 1);
    reportSet.splice(reportIndex+relativeMove, 0, report);
    dispatch(dashboardsUpdateFormState('reportSet', reportSet) as Any<FixInRefactor>);
  }
  const onSaveDashboard = async (dashboard) => {
    const ok = await dashboardsUpdate(dispatch, dashboard);
    if (ok) {
      showToast(dispatch, {text: 'Successfully saved dashboard.'});
      window.location.href = `#/dashboards/${dashboard.id}`;
    } else {
      showToast(dispatch, {text: 'Error saving dashboard.', type: 'error'});
    }
  }
  const onShowDeleteConfirm = async (dashboard) => {
    showModal(dispatch, 'MODAL_CONFIRM', {
      prompt: 'Are you sure you want to delete this dashboard?',
      confirmText: 'Delete',
      callback: async () => {
        const ok = await dashboardsDestroy(dispatch, dashboard);
        if (ok) {
          window.location.href = `#/dashboards`;
          showToast(dispatch, { text: 'Dashboard deleted successfully' });
        } else {
          showToast(dispatch, { type: 'error', text: 'Error deleting dashboard' });
        }
      }
    });
  }
  const onCreateReport = async (dashboardDate, dashboardWeekStart) => {
    await openReportModal(
      dispatch,
      { name: '', type: '', settings: {}, creatorEmail: '' },
      PAGE_NEW_REPORT_TYPE,
      OPERATION_CREATE,
      dashboardDate,
      dashboardWeekStart,
    );
  }
  const onAddExistingReport = async (dashboardDate, dashboardWeekStart) => {
    await openReportModal(
      dispatch,
      { name: '', type: '', settings: {}, creatorEmail: '' },
      PAGE_PICK_SAVED_REPORT,
      OPERATION_CREATE,
      dashboardDate,
      dashboardWeekStart,
    );
  }
  const onEditReport = async (report, dashboardDate, dashboardWeekStart) => {
    await openReportModal(
      dispatch,
      report,
      PAGE_NEW_REPORT_CONFIGURATION,
      OPERATION_UPDATE,
      dashboardDate,
      dashboardWeekStart,
    );
  }
  const onSaveReportModal = async (formState, report) => {
    const shouldCreateReport = typeof report.id === 'undefined';
    let result;
    if (shouldCreateReport) {
      result = await reportCreate(dispatch, report);
    } else {
      result = await reportUpdate(dispatch, report);
    }

    if (!result) {
      showToast(dispatch, { text: 'Error creating report.', type: 'error' });
      return;
    } 

    showToast(dispatch, {text: 'Saved report.'});

    // Add report to the dashboard if it's a newly created report
    if (shouldCreateReport) {
      dispatch(dashboardsUpdateFormState('reportSet', [...formState.reportSet, result]) as Any<FixInRefactor>);
    }

    await closeReportModal(dispatch);
  }
  const onReportShowDeletePopup = async (formState, report) => {
    await closeReportModal(dispatch);

    // Show a popup to allow the user to pick if they want to delete the link or also the report if
    // this is the last instance if this report in a dashboard.
    showModal(dispatch, 'MODAL_CONFIRM', {
      prompt: [
        'Are you sure you want to delete this report? This will delete the report from the system',
        `${report.dashboardCount > 1 ? ` and also remove it from ${report.dashboardCount-1} other ${report.dashboardCount-1 === 1 ? 'dashboard' : 'dashboards'}` : 'and any dashboards it is part of'}.`,
      ].join(''),
      confirmText: 'Delete',
      callback: async () => {
        // Delete the report from all dashboards. This also cascades to delete all report
        // dashboard links too on the server.
        const ok = await reportDelete(dispatch, report);

        if (ok) {
          // Remove report from dashboard locally
          dispatch(dashboardsUpdateFormState(
            'reportSet',
            formState.reportSet.filter(r => r.id !== report.id),
          ) as Any<FixInRefactor>);

          showToast(dispatch, {text: 'Successfully deleted report from dashboard.'});
        } else {
          showToast(dispatch, {text: 'Error deleting report from dashboard.', type: 'error'});
        }

        await closeReportModal(dispatch);
      },
    });
  }
  const onRemoveReportFromDashboard = async (formState, report) => {
    // Only delete the link, not the report itself
    dispatch(dashboardsUpdateFormState(
      'reportSet',
      formState.reportSet.filter(r => r.id !== report.id),
    ) as Any<FixInRefactor>);

    showToast(dispatch, {text: 'Removed report from dashboard.'});
    await closeReportModal(dispatch);
  }

  return (
    <DashboardEdit
      activeModal={activeModal}
      spaceHierarchy={spaceHierarchy}
      dashboards={dashboards}
      selectedDashboard={selectedDashboard}
      calculatedReportDataForPreviewedReport={calculatedReportDataForPreviewedReport}
      dashboardWeekStart={dashboardWeekStart}
      dashboardDate={dashboardDate}

      onCloseModal={onCloseModal}
      onUpdateFormState={onUpdateFormState}
      onRelativeReportMove={onRelativeReportMove}
      onSaveDashboard={onSaveDashboard}
      onShowDeleteConfirm={onShowDeleteConfirm}
      onCreateReport={onCreateReport}
      onAddExistingReport={onAddExistingReport}
      onEditReport={onEditReport}
      onSaveReportModal={onSaveReportModal}
      onReportShowDeletePopup={onReportShowDeletePopup}
      onRemoveReportFromDashboard={onRemoveReportFromDashboard}
    />
  )
}

export default ConnectedDashboardEdit;
