import React, { ReactNode, Fragment } from 'react';
import changeCase from 'change-case';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import Report, { REPORTS } from '@density/reports';

import showModal from '../../actions/modal/show';
import updateModal from '../../actions/modal/update';
import dashboardsUpdateFormState from '../../actions/dashboards/update-form-state';
import dashboardsUpdate from '../../actions/dashboards/update';
import showToast from '../../actions/toasts'; 

import GenericLoadingState from '../generic-loading-state';
import ListView, { ListViewColumn } from '../list-view';
import { SpacePickerDropdown } from '../space-picker';
import spaceHierarchyFormatter, { SpaceHierarchyDisplayItem } from '../../helpers/space-hierarchy-formatter';
import debounce from 'lodash.debounce';

import filterCollection from '../../helpers/filter-collection';

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
import reportCreate from '../../actions/dashboards/report-create';
import reportUpdate from '../../actions/dashboards/report-update';
import reportDelete from '../../actions/dashboards/report-delete';


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
      reportListSearchString: string,
    },
  },
  spaceHierarchy: {
    data: Array<DensitySpaceHierarchyItem>,
  },
  reportList: Array<DensityReport>,
  reportsInSelectedDashboard: Array<DensityReport>,
  calculatedReportDataForPreviewedReport: {
    state: string,
    data: any,
  },
  onSaveReportModal: (object) => void,
  onCloseModal: () => void,
  onUpdateModal: (key: string, value: any) => void,
  onReportSettingsUpdated: (DensityReport) => void, // Causes the report to rerun calculations and rerender
  onReportModalMovedToReportConfigurationPage: (
    report: DensityReport,
    hierarchy: Array<SpaceHierarchyDisplayItem>,
  ) => void,
  onAddReportToDashboard: (DensityReport) => void,
  onShowDeletePopup: (DensityReport) => void,
};

const HEADER_REPORT = {
  component: null,
  calculations: null,
  metadata: {
    displayName: 'Header',
    description: 'A title that can be inserted above a set of reports.',
    controls: [],
  },
};

function DashboardReportModal({
  activeModal,
  spaceHierarchy,
  reportList,
  reportsInSelectedDashboard,
  calculatedReportDataForPreviewedReport,

  onUpdateModal,
  onCloseModal,
  onSaveReportModal,
  onReportSettingsUpdated,
  onReportModalMovedToReportConfigurationPage,
  onAddReportToDashboard,
  onShowDeletePopup,
}: DashboardReportModalProps) {
  if (activeModal.name === 'REPORT_MODAL') {
    let selectedReportType = REPORTS[activeModal.data.report.type];
    if (activeModal.data.report.type === 'HEADER') {
      selectedReportType = HEADER_REPORT;
    }

    const formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy.data);

    const filterReportCollection = filterCollection({fields: ['name', 'displayType']});
    const filterReportTypeCollection = filterCollection({fields: ['displayName']});

    let modalWidth = 1024,
        modalHeight = 800;
    if (activeModal.data.page === PAGE_PICK_EXISTING_REPORT) {
      modalWidth = 580;
    }
    // When editing a header, there isn't a sidebar so make the modal smaller.
    if (
      activeModal.data.page === PAGE_NEW_REPORT_CONFIGURATION &&
      activeModal.data.report.type === 'HEADER'
    ) {
      modalWidth = 580;
      modalHeight = 350;
    }

    return (
      <Modal
        visible={activeModal.visible}
        width={modalWidth}
        height={modalHeight}
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
          <Fragment>
            <div className={styles.reportModalSearchBar}>
              <AppBar>
                <InputBox
                  type="text"
                  placeholder={'ex: "Cafeteria Traffic"'}
                  leftIcon={<Icons.Search />}
                  value={activeModal.data.reportListSearchString}
                  onChange={e => onUpdateModal('reportListSearchString', e.target.value)}
                  width="100%"
                />
              </AppBar>
            </div>
            <div className={styles.reportModalReportList}>
              {reportList.length === 0 ? (
                <p>No reports exist in your organization.</p>
              ) : (
                <ListView data={filterReportCollection(reportList, activeModal.data.reportListSearchString)}>
                  <ListViewColumn
                    title=""
                    template={item => <RadioButton
                      checked={item.id === activeModal.data.pickExistingReportSelectedReportId}
                      onChange={() => onUpdateModal('pickExistingReportSelectedReportId', item.id)}
                      // Cannot select reports that are already in the dashboard
                      disabled={Boolean(reportsInSelectedDashboard.find(report => report.id === item.id))}
                    />}
                    flexGrow={0}
                    flexShrink={0}
                    width={50}
                  />
                  <ListViewColumn
                    title="Name"
                    template={item => item.name}
                    flexGrow={1}
                    onClick={item => {
                      if (!reportsInSelectedDashboard.find(report => report.id === item.id)) {
                        onUpdateModal('pickExistingReportSelectedReportId', item.id)
                      }
                    }}
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
                    onClick={item => {
                      if (!reportsInSelectedDashboard.find(report => report.id === item.id)) {
                        onUpdateModal('pickExistingReportSelectedReportId', item.id)
                      }
                    }}
                    flexGrow={1}
                  />
                </ListView>
              )}
            </div>
          </Fragment>
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
                  filterReportTypeCollection(
                    [
                      ['HEADER', HEADER_REPORT],
                      ...(Object.entries(REPORTS)),
                    ].map(([key, value]) => ({ ...(value as any).metadata, id: key })),
                    activeModal.data.newReportReportTypeSearchString,
                  ).map(metadata => (
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
                    onChange={e => {
                      const report = {...activeModal.data.report, name: e.target.value};
                      onUpdateModal('report', report);

                      // Called so that the report calculations can be rerun
                      onReportSettingsUpdated(report);
                    }}
                  />}
                />
                {selectedReportType.metadata.controls.map(control => {
                  const id = `reports-control-${control.label.replace(' ', '-')}`;
                  const fieldName = changeCase.camel(control.parameters.field);
                  let input: ReactNode = null;

                  function reportUpdateSettings(key, value) {
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
                        onChange={value => reportUpdateSettings(
                          fieldName,
                          control.parameters.canSelectMultiple ? (
                            value.map(i => i.space.id) // Array of space ids
                          ) : (
                            value.space.id // Single space id
                          )
                        )}
                        formattedHierarchy={formattedHierarchy}
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
                        onChange={choice => reportUpdateSettings(fieldName, choice.id)}
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
                        onChange={choice => reportUpdateSettings(fieldName, choice.id)}
                      />
                    );
                    break;
                  case 'BOOLEAN':
                    input = (
                      <Switch
                        id={id}
                        value={activeModal.data.report.settings[fieldName]}
                        onChange={e => {
                          reportUpdateSettings(fieldName, e.target.checked)
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
                          activeModal.data.report.settings[fieldName]
                        }
                        onChange={e => {
                          // Modify the string version of the field name and use taht as the "working copy"
                          reportUpdateSettings(`_${fieldName}String`, e.target.value);
                          // But also create a numberical version of the field from the string
                          // version, and this is what is actually used by the report when rendering
                          reportUpdateSettings(fieldName, parseInt(e.target.value, 10));
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
                        value={activeModal.data.report.settings[fieldName]}
                        onChange={e => reportUpdateSettings(fieldName, e.target.value)}
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
                <Button
                  variant="underline"
                  type="danger"
                  onClick={() => onShowDeletePopup(activeModal.data.report)}
                >Delete report</Button>
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
                {activeModal.data.page === PAGE_PICK_EXISTING_REPORT ? (
                  <Button
                    variant="filled"
                    width={65}
                    disabled={
                      activeModal.data.page === PAGE_PICK_EXISTING_REPORT &&
                      !activeModal.data.pickExistingReportSelectedReportId
                    }
                    onClick={() => {
                      const report = reportList.find(
                        r => r.id === activeModal.data.pickExistingReportSelectedReportId
                      );
                      onAddReportToDashboard(report);
                    }}
                  >Save</Button>
                ) : null}
                {activeModal.data.page === PAGE_NEW_REPORT_TYPE ? (
                  <Button
                    variant="filled"
                    onClick={() => {
                      // Run report calculations with the values specified
                      onReportModalMovedToReportConfigurationPage(
                        activeModal.data.report,
                        formattedHierarchy,
                      );
                      onUpdateModal('page', PAGE_NEW_REPORT_CONFIGURATION);
                    }}
                    width={65}
                    disabled={!activeModal.data.report.type}
                  >Next</Button>
                ) : null}
                {activeModal.data.page === PAGE_NEW_REPORT_CONFIGURATION ? (
                  <Button
                    variant="filled"
                    onClick={() => onSaveReportModal(activeModal.data.report)}
                    width={65}
                    disabled={
                      activeModal.data.page === PAGE_NEW_REPORT_CONFIGURATION &&
                      activeModal.data.report.name.length === 0
                    }
                  >Save</Button>
                ) : null}
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
  onSaveDashboard,

  onCreateReport,
  onEditReport,
  onCloseModal,
  onUpdateModal,
  onReportSettingsUpdated,
  onReportModalMovedToReportConfigurationPage,
  onSaveReportModal,
  onShowDeletePopup,
}) {
  return (
    <Fragment>
      <DashboardReportModal
        activeModal={activeModal}
        spaceHierarchy={spaceHierarchy}
        calculatedReportDataForPreviewedReport={calculatedReportDataForPreviewedReport}
        // List of all reports from the server (ie, the response of GET /v2/reports)
        reportList={dashboards.reportList}
        // List of all reports in the working copy of the selected dashboard
        // (ie, `report_set` from GET /v2/dashboards/:id)
        reportsInSelectedDashboard={dashboards.formState ? dashboards.formState.reportSet : []}

        onUpdateModal={onUpdateModal}
        onReportSettingsUpdated={onReportSettingsUpdated}
        onReportModalMovedToReportConfigurationPage={onReportModalMovedToReportConfigurationPage}
        onAddReportToDashboard={report => {
          onUpdateFormState('reportSet', [ ...dashboards.formState.reportSet, report ]);
          onCloseModal();
        }}
        onShowDeletePopup={report => onShowDeletePopup(selectedDashboard, report)}

        onSaveReportModal={report => onSaveReportModal(selectedDashboard, report)}
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
                    ) : (
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
                            <Button
                              variant="underline"
                              onClick={() => onEditReport(item)}
                            >Edit</Button>
                          )}
                        />
                      </ListView>
                    )}
                  </DetailModule>
                </div>
              ) : null}
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
  onCreateReport() {
    dispatch<any>(openReportModal(
      { name: '', type: '', settings: {}, creatorEmail: '' },
      PAGE_PICK_EXISTING_REPORT,
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
  onCloseModal() {
    dispatch<any>(closeReportModal());
  },
  onUpdateModal(key, value) {
    dispatch<any>(updateModal({[key]: value}));
  },
  async onSaveReportModal(dashboard, report) {
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
      dispatch<any>(dashboardsUpdateFormState('reportSet', [...dashboard.reportSet, result]));
    }

    dispatch<any>(closeReportModal());
  },
  onReportSettingsUpdated: debounce(report => {
    dispatch<any>(rerenderReportInReportModal(report));
  }, 500),
  onReportModalMovedToReportConfigurationPage(report, formattedHierarchy) {
    // Set default parameters for a newly created report
    const reportType = report.type === 'HEADER' ? HEADER_REPORT : REPORTS[report.type];
    const initialReportSettings = reportType.metadata.controls.reduce((acc, control) => {
      const fieldName = changeCase.camel(control.parameters.field);

      let value;
      switch (control.type) {
      case 'SPACE_PICKER':
        const firstSpaceInHierarchy = formattedHierarchy.find(i => i.space.spaceType === 'space');
        value = (
          report.settings[fieldName] ||
          control.parameters.defaultValue ||
          (firstSpaceInHierarchy ? firstSpaceInHierarchy.space.id : false) ||
          null
        );
        break;
      case 'TIME_RANGE_PICKER':
        value = (
          report.settings[fieldName] ||
          control.parameters.defaultValue ||
          'LAST_WEEK' // default fallback value
        );
        break;
      case 'SELECT_BOX':
        value = (
          report.settings[fieldName] ||
          control.parameters.defaultValue ||
          (control.parameters.choices.length > 0 ? control.parameters.choices[0].id : false) ||
          null
        );
        break;
      case 'BOOLEAN':
        value = (
          report.settings[fieldName] ||
          control.parameters.defaultValue ||
          false
        );
        break;
      case 'NUMBER':
        value = (
          report.settings[`_${fieldName}String`] ||
          report.settings[fieldName] ||
          control.parameters.defaultValue ||
          ''
        );
        break;
      default:
        value = (
          report.settings[fieldName] ||
          control.parameters.defaultValue ||
          ''
        );
        break;
      }

      return { ...acc, [fieldName]: value };
    }, {});
    const reportWithInitialSettings = { ...report, settings: initialReportSettings };
    dispatch<any>(updateModal({ report: reportWithInitialSettings }));

    // Then perform the initial rendering of the report
    dispatch<any>(rerenderReportInReportModal(reportWithInitialSettings));
  },
  async onShowDeletePopup(selectedDashboard, report) {
    if (report.dashboardCount === 1) {
      await dispatch<any>(closeReportModal());

      // Show a popup to allow the user to pick if they want to delete the link or also the report if
      // this is the last instance if this report in a dashboard.
      dispatch<any>(showModal('MODAL_CONFIRM', {
        prompt: 'Are you sure you want to delete this report? As this is the last dashboard containing the report, this will also delete the report too.',
        confirmText: 'Delete',
        callback: async () => {
          // Delete the report from all dashboards. This also cascades to delete all report
          // dashboard links too.
          const ok = await dispatch<any>(reportDelete(report));

          if (ok) {
            // Remove report from dashboard locally
            dispatch(dashboardsUpdateFormState(
              'reportSet',
              selectedDashboard.reportSet.filter(r => r.id !== report.id),
            ));

            dispatch<any>(showToast({text: 'Successfully deleted report from dashboard.'}));
          } else {
            dispatch<any>(showToast({text: 'Error deleting report from dashboard.', type: 'error'}));
          }
        },
      }));
    } else {
      dispatch<any>(closeReportModal());

      // This report is in multiple dashboards, so only allow deletion of the link.
      dispatch(dashboardsUpdateFormState(
        'reportSet',
        selectedDashboard.reportSet.filter(r => r.id !== report.id),
      ));

      dispatch<any>(showToast({text: 'Deleted report from dashboard.'}));
    }
  },
}))(DashboardEdit);
