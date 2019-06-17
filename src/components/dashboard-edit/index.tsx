import React, { ReactNode, Fragment } from 'react';
import camelcase from 'camelcase';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import Report, { REPORTS } from '@density/reports';

import updateModal from '../../actions/modal/update';
import dashboardsUpdateFormState from '../../actions/dashboards/update-form-state';

import GenericLoadingState from '../generic-loading-state';
import ListView, { ListViewColumn } from '../list-view';
import { SpacePickerDropdown } from '../space-picker';
import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';
import debounce from 'lodash.debounce';

import hourlyBreakdownScreenshot from '../../Screen Shot 2019-06-10 at 12.23.41 PM.png'

import {
  openReportModal,
  closeReportModal,
  rerenderReportInReportModal,

  ReportModalPages,
  PAGE_PICK_EXISTING_REPORT,
  PAGE_NEW_REPORT_TYPE,
  PAGE_NEW_REPORT_CONFIGURATION,

  ReportOperationType,
  OPERATION_CREATE,
  OPERATION_UPDATE,

  extractCalculatedReportDataFromDashboardsReducer,
} from '../../actions/dashboards/report-modal';

import {
  AppFrame,
  AppPane,
  AppBar,
  AppBarTitle,
  AppBarSection,
  AppBarContext,
  Button,
  ButtonGroup,
  Icons,
  InputBox,
  Modal,
  RadioButton,
  Switch,
} from '@density/ui';
import DetailModule from '../admin-locations-detail-modules';
import FormLabel from '../form-label';
import { DensityReport, DensitySpaceHierarchyItem } from '../../types';

type DashboardReportModalProps = {
  activeModal: {
    name: string,
    visible: boolean,
    data: {
      page: ReportModalPages,
      operationType: ReportOperationType,
      report: DensityReport,
      pickExistingReportSelectedReportId: string | null,
      newReportReportTypeSearchString: string,
    },
  },
  spaceHierarchy: {
    data: Array<DensitySpaceHierarchyItem>,
  },
  calculatedReportDataForPreviewedReport: {
    state: string,
    data: any,
  },
  onAddExistingReportToDashboard: (DensityReport) => void,
  onAddNewReport: (object) => void,
  onCloseModal: () => void,
  onUpdateModal: (key: string, value: any) => void,
  onReportSettingsUpdated: (DensityReport) => void, // Causes the report to rerun calculations and rerender
};

function DashboardReportModal({
  activeModal,
  spaceHierarchy,
  calculatedReportDataForPreviewedReport,

  onUpdateModal,
  onCloseModal,
  onAddExistingReportToDashboard,
  onAddNewReport,
  onReportSettingsUpdated,
}: DashboardReportModalProps) {
  if (activeModal.name === 'REPORT_MODAL') {
    let selectedReportType = REPORTS[activeModal.data.report.type];
    if (activeModal.data.report.type === 'HEADER') {
      selectedReportType = {
        metadata: {
          displayName: 'Header',
          description: 'Inserts a text label between two sections of reports',
          controls: [],
        },
      };
    }

    return (
      <Modal
        visible={activeModal.visible}
        width={activeModal.data.page === PAGE_PICK_EXISTING_REPORT ? 580 : 1024}
        height={800}
        onBlur={onCloseModal}
        onEscape={onCloseModal}
      >
        <AppBar>
          <AppBarTitle>
            {
              activeModal.data.page === PAGE_PICK_EXISTING_REPORT ? (
                'Add Report to Dashboard'
              ) : `${activeModal.data.operationType === OPERATION_CREATE ? 'New' : 'Edit'} Report`
            }
          </AppBarTitle>
          {activeModal.data.page === PAGE_PICK_EXISTING_REPORT ? (
            <AppBarSection>
              <Button
                variant="filled"
                onClick={() => onUpdateModal('page', PAGE_NEW_REPORT_TYPE)}
              >Create new report</Button>
            </AppBarSection>
          ) : null}
        </AppBar>

        {activeModal.data.page === PAGE_PICK_EXISTING_REPORT ? (
          <div className={styles.reportModalReportList}>
            <ListView data={[{id: 1, name: 'My cool report'}]}>
              <ListViewColumn
                title=""
                template={item => <RadioButton
                  checked={item.id === activeModal.data.pickExistingReportSelectedReportId}
                  onChange={() => onUpdateModal('pickExistingReportSelectedReportId', item.id)}
                />}
                flexGrow={0}
                flexShrink={0}
              />
              <ListViewColumn
                title="Name"
                template={item => 'HARDCODED'}
                flexGrow={1}
                onClick={item => onUpdateModal('pickExistingReportSelectedReportId', item.id)}
              />
              <ListViewColumn
                title="Report Type"
                template={item => 'HARDCODED'}
                onClick={item => onUpdateModal('pickExistingReportSelectedReportId', item.id)}
                flexGrow={1}
              />
            </ListView>
          </div>
        ) : null}

        {activeModal.data.page === PAGE_NEW_REPORT_TYPE ? (
          <div className={styles.parent}>
            <div className={styles.left}>
              <div className={styles.searchBar}>
                <AppBar>
                  <InputBox
                    type="text"
                    leftIcon={<Icons.Search />}
                    placeholder="Search for report type"
                    value={activeModal.data.newReportReportTypeSearchString}
                    onChange={e => onUpdateModal('newReportReportTypeSearchString', e.target.value)}
                    width="100%"
                  />
                </AppBar>
              </div>
              <div className={styles.reportTypeList}>
                {
                  Object.entries(REPORTS)
                  .map(([key, value]) => ({...(value as any).metadata, id: key}))
                  .map(metadata => (
                    <div
                      key={metadata.id}
                      className={styles.reportTypeItem}
                      onClick={() => onUpdateModal('report', {...activeModal.data.report, type: metadata.id})}
                    >
                      <div>
                        <div className={styles.nameRow}>
                          <RadioButton
                            checked={activeModal.data.report.type === metadata.id}
                            onChange={() => onUpdateModal('report', {...activeModal.data.report, type: metadata.id})}
                          />
                          <span className={styles.name}>{metadata.displayName}</span>
                        </div>
                        <p className={styles.reportTypeItemDescription}>
                          {metadata.description.slice(0, 80) + '...'}
                        </p>
                      </div>
                      <img
                        className={styles.reportTypeImage}
                        src={hourlyBreakdownScreenshot}
                        alt=""
                      />
                    </div>
                  ))
                }
              </div>
            </div>
            <div className={styles.right}>
              <AppBarContext.Provider value="CARD_HEADER">
                <AppBar>
                  <AppBarTitle>
                    {selectedReportType ? selectedReportType.metadata.displayName : null}
                  </AppBarTitle>
                </AppBar>
              </AppBarContext.Provider>
              <div className={styles.reportImageBackdrop}>
                REPORT IMAGE HERE
              </div>
              <p className={styles.reportFullDescription}>
                {selectedReportType ? selectedReportType.metadata.description : null}
              </p>
            </div>
          </div>
        ) : null}

        {activeModal.data.page === PAGE_NEW_REPORT_CONFIGURATION && selectedReportType ? (
          <div className={styles.parent}>
            <div className={styles.left}>
              <AppBarContext.Provider value="CARD_HEADER">
                <AppBar>
                  <AppBarTitle>{selectedReportType.metadata.displayName}</AppBarTitle>
                </AppBar>
              </AppBarContext.Provider>
              <div className={styles.reportConfigurationParent}>
                <FormLabel
                  label="Name"
                  htmlFor="reports-name"
                  input={<InputBox
                    type="text"
                    id="reports-name"
                    width="100%"
                    placeholder={`ex: "Cafeteria Weekly Visits"`}
                    value={activeModal.data.report.name}
                    onChange={e => onUpdateModal('report', {...activeModal.data.report, name: e.target.value})}
                  />}
                />
                {selectedReportType.metadata.controls.map(control => {
                  const id = `reports-control-${control.label.replace(' ', '-')}`;
                  const fieldName = camelcase(control.parameters.field);
                  let input: ReactNode = null;

                  function updateReportSettings(key, value) {
                    const report = {
                      ...activeModal.data.report,
                      settings: { ...activeModal.data.report.settings, [key]: value },
                    };
                    onUpdateModal('report', report);

                    // Called so that the report calculations can be rerun
                    onReportSettingsUpdated(report);
                  }

                  switch (control.type) {
                  case 'SPACE_PICKER':
                    input = (
                      <SpacePickerDropdown
                        value={activeModal.data.report.settings[fieldName]}
                        onChange={value => updateReportSettings(
                          fieldName,
                          control.parameters.canSelectMultiple ? (
                            value.map(i => i.space.id) // Array of space ids
                          ) : (
                            value.space.id // Single space id
                          )
                        )}
                        formattedHierarchy={spaceHierarchyFormatter(spaceHierarchy.data)}
                        width="100%"
                        canSelectMultiple={control.parameters.canSelectMultiple}
                        dropdownWidth="100%"
                      />
                    );
                    break;
                  case 'TIME_RANGE_PICKER':
                    input = (
                      <InputBox
                        type="select"
                        id={id}
                        width="100%"
                        value={activeModal.data.report.settings[fieldName]}
                        choices={[
													{id: 'LAST_WEEK', label: 'Last Week' },
													{id: 'LAST_4_WEEKS', label: 'Last 4 weeks' },
													{id: 'WEEK_TO_DATE', label: 'Week to date' },
													{id: 'LAST_7_DAYS', label: 'Last 7 days' },
													{id: 'LAST_28_DAYS', label: 'Last 28 days' },
													{id: 'CUSTOM_RANGE', label: 'Custom Range...' },
                        ]}
                        onChange={choice => updateReportSettings(fieldName, choice.id)}
                      />
                    );
                    break;
                  case 'SELECT_BOX':
                    input = (
                      <InputBox
                        type="select"
                        id={id}
                        width="100%"
                        value={activeModal.data.report.settings[fieldName]}
                        choices={control.parameters.choices}
                        onChange={choice => updateReportSettings(fieldName, choice.id)}
                      />
                    );
                    break;
                  case 'BOOLEAN':
                    input = (
                      <Switch
                        id={id}
                        value={
                          activeModal.data.report.settings[fieldName] ||
                          control.parameters.defaultValue ||
                          false
                        }
                        onChange={e => {
                          updateReportSettings(fieldName, e.target.checked)
                        }}
                      />
                    );
                    break;
                  case 'NUMBER':
                    input = (
                      <InputBox
                        type="number"
                        id={id}
                        width="100%"
                        value={
                          activeModal.data.report.settings[`_${fieldName}String`] ||
                          activeModal.data.report.settings[fieldName] ||
                          control.parameters.defaultValue ||
                          ''
                        }
                        onChange={e => {
                          // Modify the string version of the field name and use taht as the "working copy"
                          updateReportSettings(`_${fieldName}String`, e.target.value);
                          // But also create a numberical version of the field from the string
                          // version, and this is what is actually used by the report when rendering
                          updateReportSettings(fieldName, parseInt(e.target.value, 10));
                        }}
                      />
                    );
                    break;
                  default:
                    input = (
                      <InputBox
                        type={control.type.toLowerCase()} // text, number, etc
                        id={id}
                        width="100%"
                        value={activeModal.data.report.settings[fieldName] || control.parameters.defaultValue || ''}
                        onChange={e => updateReportSettings(fieldName, e.target.value)}
                      />
                    );
                    break;
                  }

                  return (
                    <FormLabel
                      label={control.label}
                      key={control.label}
                      htmlFor={id}
                      input={input}
                    />
                  );
                })}
              </div>
            </div>
            {activeModal.data.report && activeModal.data.report.type !== 'HEADER' ? (
              <div className={styles.right}>
                <AppBarContext.Provider value="CARD_HEADER">
                  <AppBar>
                    <AppBarTitle>Preview</AppBarTitle>
                  </AppBar>
                </AppBarContext.Provider>
                <div className={styles.reportBackdrop}>
                  {calculatedReportDataForPreviewedReport.state === 'LOADING' ? (
                    <div className={styles.centered}>
                      <GenericLoadingState />
                    </div>
                  ) : (
                    <Report
                      report={activeModal.data.report}
                      reportData={calculatedReportDataForPreviewedReport}
                      expanded
                    />
                  )}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection>
              {activeModal.data.operationType === OPERATION_UPDATE ? (
                <Button variant="underline" type="danger">Delete report</Button>
              ) : null}
            </AppBarSection>
            <AppBarSection>
              <ButtonGroup>
                <Button
                  variant="underline"
                  onClick={onCloseModal}
                >Cancel</Button>
                {activeModal.data.page !== PAGE_PICK_EXISTING_REPORT && activeModal.data.operationType === OPERATION_CREATE ? (
                  <Button onClick={() => {
                    switch (activeModal.data.page) {
                    case PAGE_NEW_REPORT_TYPE:
                      onUpdateModal('page', PAGE_PICK_EXISTING_REPORT);
                      return;
                    case PAGE_NEW_REPORT_CONFIGURATION:
                      onUpdateModal('page', PAGE_NEW_REPORT_TYPE);
                      return;
                    default:
                      return
                    }
                  }}>Back</Button>
                ) : null}
                {activeModal.data.page === PAGE_NEW_REPORT_TYPE ? (
                  <Button
                    variant="filled"
                    onClick={() => onUpdateModal('page', PAGE_NEW_REPORT_CONFIGURATION)}
                    width={65}
                    disabled={activeModal.data.report.type === null}
                  >Next</Button>
                ): (
                  <Button variant="filled" width={65}>Save</Button>
                )}
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Modal>
    );
  } else {
    return null;
  }
}

export function DashboardEdit({
  activeModal,
  selectedDashboard,
  spaceHierarchy,
  dashboards,
  calculatedReportDataForPreviewedReport,

  onUpdateFormState,
  onRelativeReportMove,
  onCreateReport,
  onEditReport,
  onCloseModal,
  onUpdateModal,
  onReportSettingsUpdated,
}) {
  return (
    <Fragment>
      <DashboardReportModal
        activeModal={activeModal}
        spaceHierarchy={spaceHierarchy}
        calculatedReportDataForPreviewedReport={calculatedReportDataForPreviewedReport}
        onUpdateModal={onUpdateModal}
        onReportSettingsUpdated={onReportSettingsUpdated}

        onAddExistingReportToDashboard={report => {
          console.log('EXISTING REPORT', report)
        }}
        onAddNewReport={report => {
          console.log('NEW REPORT', report)
        }}
        onCloseModal={onCloseModal}
      />

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
              {dashboards.formState.reportSet ? (
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
              ) : null}
            </div>
          </AppPane>
        </AppFrame>
      ) : null}
    </Fragment>
  )
}

export default connect((state: any) => ({
  activeModal: state.activeModal,
  selectedDashboard: state.dashboards.data.find(dashboard => dashboard.id === state.dashboards.selected),
  spaceHierarchy: state.spaceHierarchy,
  dashboards: state.dashboards,
  calculatedReportDataForPreviewedReport: extractCalculatedReportDataFromDashboardsReducer(state.dashboards),
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
    dispatch<any>(
      openReportModal(
        { name: '', type: '', settings: {}, creatorEmail: '' },
        PAGE_PICK_EXISTING_REPORT,
        OPERATION_CREATE,
      )
    );
  },
  onEditReport(report) {
    dispatch<any>(openReportModal(
      report,
      PAGE_NEW_REPORT_CONFIGURATION,
      OPERATION_UPDATE,
    ));
  },
  onCloseModal() {
    dispatch<any>(closeReportModal());
  },
  onUpdateModal(key, value) {
    dispatch<any>(updateModal({[key]: value}));
  },
  onReportSettingsUpdated: debounce(report => {
    dispatch<any>(rerenderReportInReportModal(report));
  }, 500),
}))(DashboardEdit);
