import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import GenericLoadingState from '../generic-loading-state';
import ListView, { ListViewColumn } from '../list-view/index';
import dashboardsUpdateFormState from '../../actions/dashboards/update-form-state';

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
  Modal,
} from '@density/ui';
import DetailModule from '../admin-locations-detail-modules';
import FormLabel from '../form-label';


export function DashboardEdit({
  activeModal,
  dashboards,
  selectedDashboard,

  onUpdateFormState,
  onRelativeReportMove,
  onCreateReport,
  onEditReport,
  onCloseModal,
}) {
  return (
    <Fragment>
      {dashboards.view === 'LOADING' ? (
        <div className={styles.centered}>
          <GenericLoadingState />
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
                Edit "{selectedDashboard.name}"
              </AppBarTitle>
              <AppBarSection>
                <ButtonGroup>
                  <Button variant="underline" href={`#/dashboards/${selectedDashboard.id}`}>Cancel</Button>
                  <Button variant="filled">Save</Button>
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
                      value={dashboards.formState.name}
                      onChange={e => onUpdateFormState('name', e.target.value)}
                    />}
                  />
                </DetailModule>
              </div>
              <div className={styles.dashboardEditModuleWrapper}>
                <DetailModule title="Reports" actions={(
                  <AppBarSection>
                    <Button variant="filled" onClick={onCreateReport}>
                      Add report
                    </Button>
                  </AppBarSection>
                )}>
                  {dashboards.formState.reportSet.length === 0 ? (
                    <p>There are no reports in this dashboard.</p>
                  ) : null}

                  <ListView data={dashboards.formState.reportSet}>
                    <ListViewColumn
                      title="Name"
                      template={item => (
                        <Fragment>
                          <Icons.Soup />
                          <span className={styles.name}>
                            {item.name}
                          </span>
                        </Fragment>
                      )}
                    />
                    <ListViewColumn
                      title=""
                      template={item => (
                        <ButtonGroup>
                          <span style={{
                            // Can not move first report further up in the list
                            visibility: item.id === dashboards.formState.reportSet[0].id ? 'hidden' : 'visible',
                          }}>
                            <Button
                              onClick={() => onRelativeReportMove(dashboards.formState, item, -1)}
                              variant="underline"
                            >
                              <Icons.ArrowUp width={12} height={12} />
                            </Button>
                          </span>
                          {item.id !== dashboards.formState.reportSet[dashboards.formState.reportSet.length-1].id ? (
                            <Button
                              onClick={() => onRelativeReportMove(dashboards.formState, item, 1)}
                              variant="underline"
                            >
                              <Icons.ArrowDown width={12} height={12} />
                            </Button>
                          ) : null}
                        </ButtonGroup>
                      )}
                      flexGrow={1}
                    />
                    <ListViewColumn
                      title="Report Type"
                      template={item => 'HARDCODED'}
                      flexGrow={1}
                    />
                    <ListViewColumn
                      title=""
                      template={item => (
                        <Button
                          variant="underline"
                          onClick={() => onEditReport(item)}
                        >Edit</Button>
                      )}
                    />
                  </ListView>
                </DetailModule>
              </div>
            </div>
          </AppPane>
        </AppFrame>
      ) : null}
    </Fragment>
  )
}

export default connect((state: any) => ({
  foo: 1,
  dashboards: state.dashboards,
  selectedDashboard: state.dashboards.data.find(dashboard => dashboard.id === state.dashboards.selected),
}), dispatch => ({
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
  onCreateReport() {
    dispatch<any>(showModal('REPORT_MODAL', {
      page: PICK_EXISTING_REPORT,
      operationType: CREATE,
      report: {
        name: '',
        type: null,
        settings: {},
      },
    }));
  },
  onEditReport(report) {
    dispatch<any>(showModal('REPORT_MODAL', {
      page: NEW_REPORT_CONFIGURATION,
      operationType: UPDATE,
      report,
    }));
  },
  onCloseModal() {
    dispatch<any>(hideModal());
  },
}))(DashboardEdit);
