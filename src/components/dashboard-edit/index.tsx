import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import { REPORTS } from '@density/reports';

import showModal from '../../actions/modal/show';
import dashboardsUpdateFormState from '../../actions/dashboards/update-form-state';
import dashboardsUpdate from '../../actions/dashboards/update';
import dashboardsDestroy from '../../actions/dashboards/destroy';
import showToast from '../../actions/toasts'; 

import GenericLoadingState from '../generic-loading-state';
import GenericErrorState from '../generic-error-state';
import ListView, { ListViewColumn } from '../list-view';
import mixpanelTrack from '../../helpers/mixpanel-track';

import {
  openReportModal,
  closeReportModal,

  PAGE_PICK_SAVED_REPORT,
  PAGE_NEW_REPORT_CONFIGURATION,
  PAGE_NEW_REPORT_TYPE,

  OPERATION_CREATE,
  OPERATION_UPDATE,

  extractCalculatedReportDataFromDashboardsReducer,
} from '../../actions/dashboards/report-modal';
import reportCreate from '../../actions/dashboards/report-create';
import reportUpdate from '../../actions/dashboards/report-update';
import reportDelete from '../../actions/dashboards/report-delete';


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
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';
import DetailModule from '../admin-locations-detail-modules';
import FormLabel from '../form-label';

import DashboardReportEditModal from '../dashboard-report-edit-modal';

export function DashboardEdit({
  activeModal,
  selectedDashboard,
  spaceHierarchy,
  dashboards,
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

      {dashboards.view === 'VISIBLE' ? (
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
                      <Button onClick={onAddExistingReport}>
                        Add saved report
                      </Button>
                      <Button variant="filled" onClick={onCreateReport}>
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
                        title="Name"
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
                        title="Report Type"
                        template={item => {
                          if (item.type === 'HEADER') {
                            return 'Header';
                          } else {
                            return REPORTS[item.type] ? REPORTS[item.type].metadata.displayName : item.type;
                          }
                        }}
                        flexGrow={1}
                      />
                      <ListViewColumn
                        title=""
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
                        width="auto"
                      />
                      <ListViewColumn
                        title=""
                        template={item => (
                          <ButtonGroup>
                            <Button
                              variant="underline"
                              onClick={() => onEditReport(item)}
                            >Edit</Button>
                          </ButtonGroup>
                        )}
                        width="auto"
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

export default connect((state: any) => ({
  activeModal: state.activeModal,
  selectedDashboard: state.dashboards.data.find(dashboard => dashboard.id === state.dashboards.selected),
  spaceHierarchy: state.spaceHierarchy,
  dashboards: state.dashboards,
  calculatedReportDataForPreviewedReport: extractCalculatedReportDataFromDashboardsReducer(state.dashboards),
}), dispatch => ({
  onCloseModal() {
    dispatch<any>(closeReportModal());
  },
  onUpdateFormState(key, value) {
    dispatch(dashboardsUpdateFormState(key, value));
  },
  onRelativeReportMove(formState, report, relativeMove) {
    const reportIndex = formState.reportSet.findIndex(r => r.id === report.id);
    if (reportIndex === -1) { return; }

    const reportSet = formState.reportSet.slice();
    // Move the report `relativeMove` places in the report set array
    reportSet.splice(reportIndex, 1);
    reportSet.splice(reportIndex+relativeMove, 0, report);
    dispatch(dashboardsUpdateFormState('reportSet', reportSet));
  },
  async onSaveDashboard(dashboard) {
    const ok = await dispatch<any>(dashboardsUpdate(dashboard));
    if (ok) {
      dispatch<any>(showToast({text: 'Successfully saved dashboard.'}));
      window.location.href = `#/dashboards/${dashboard.id}`;
    } else {
      dispatch<any>(showToast({text: 'Error saving dashboard.', type: 'error'}));
    }
  },
  async onShowDeleteConfirm(dashboard) {
    dispatch<any>(showModal('MODAL_CONFIRM', {
      prompt: 'Are you sure you want to delete this dashboard?',
      confirmText: 'Delete',
      callback: async () => {
        const ok = await dispatch<any>(dashboardsDestroy(dashboard));
        if (ok) {
          dispatch<any>(showToast({ text: 'Dashboard deleted successfully' }));
        } else {
          dispatch<any>(showToast({ type: 'error', text: 'Error deleting dashboard' }));
        }
        // TODO: I am unsure exactly why this won't redirect without the timeout.
        setTimeout(() => { window.location.href = `#/dashboards`; }, 500);
      }
    }));
  },
  onCreateReport() {
    dispatch<any>(openReportModal(
      { name: '', type: '', settings: {}, creatorEmail: '' },
      PAGE_NEW_REPORT_TYPE,
      OPERATION_CREATE,
    ));
  },
  onAddExistingReport() {
    dispatch<any>(openReportModal(
      { name: '', type: '', settings: {}, creatorEmail: '' },
      PAGE_PICK_SAVED_REPORT,
      OPERATION_CREATE,
    ));
  },
  onEditReport(report) {
    dispatch<any>(openReportModal(
      report,
      PAGE_NEW_REPORT_CONFIGURATION,
      OPERATION_UPDATE,
    ));
  },
  async onSaveReportModal(formState, report) {
    const shouldCreateReport = typeof report.id === 'undefined';
    let result;
    if (shouldCreateReport) {
      result = await dispatch<any>(reportCreate(report));
    } else {
      result = await dispatch<any>(reportUpdate(report));
    }

    if (!result) {
      dispatch<any>(showToast({ text: 'Error creating report.', type: 'error' }));
      return;
    } 

    dispatch<any>(showToast({text: 'Saved report.'}));

    // Add report to the dashboard if it's a newly created report
    if (shouldCreateReport) {
      dispatch<any>(dashboardsUpdateFormState('reportSet', [...formState.reportSet, result]));
    }

    dispatch<any>(closeReportModal());
  },
  async onReportShowDeletePopup(formState, report) {
    await dispatch<any>(closeReportModal());

    // Show a popup to allow the user to pick if they want to delete the link or also the report if
    // this is the last instance if this report in a dashboard.
    dispatch<any>(showModal('MODAL_CONFIRM', {
      prompt: [
        'Are you sure you want to delete this report? This will delete the report from the system',
        `${report.dashboardCount > 1 ? ` and also remove it from ${report.dashboardCount-1} other ${report.dashboardCount-1 === 1 ? 'dashboard' : 'dashboards'}` : 'and any dashboards it is part of'}.`,
      ].join(''),
      confirmText: 'Delete',
      callback: async () => {
        // Delete the report from all dashboards. This also cascades to delete all report
        // dashboard links too on the server.
        const ok = await dispatch<any>(reportDelete(report));

        if (ok) {
          // Remove report from dashboard locally
          dispatch(dashboardsUpdateFormState(
            'reportSet',
            formState.reportSet.filter(r => r.id !== report.id),
          ));

          dispatch<any>(showToast({text: 'Successfully deleted report from dashboard.'}));
        } else {
          dispatch<any>(showToast({text: 'Error deleting report from dashboard.', type: 'error'}));
        }

        dispatch<any>(closeReportModal());
      },
    }));
  },
  onRemoveReportFromDashboard(formState, report) {
    // Only delete the link, not the report itself
    dispatch(dashboardsUpdateFormState(
      'reportSet',
      formState.reportSet.filter(r => r.id !== report.id),
    ));

    dispatch<any>(showToast({text: 'Removed report from dashboard.'}));
    dispatch<any>(closeReportModal());
  },
}))(DashboardEdit);
