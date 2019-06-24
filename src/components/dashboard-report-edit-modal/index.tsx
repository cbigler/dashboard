import React, { ReactNode, Fragment } from 'react';
import changeCase from 'change-case';
import debounce from 'lodash.debounce';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import Report, { REPORTS } from '@density/reports';

import { DensityReport, DensitySpaceHierarchyItem, DensityTimeSegmentLabel } from '../../types';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  AppBarContext,
  Button,
  ButtonGroup,
  Icons,
  InputBox,
  TagInput,
  Modal,
  RadioButton,
  Switch,
} from '@density/ui';

import updateModal from '../../actions/modal/update';
import {
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

import GenericLoadingState from '../generic-loading-state';
import ListView, { ListViewColumn } from '../list-view';
import { SpacePickerDropdown } from '../space-picker';
import FormLabel from '../form-label';

import spaceHierarchyFormatter, { SpaceHierarchyDisplayItem } from '../../helpers/space-hierarchy-formatter';
import filterCollection from '../../helpers/filter-collection';

import hourlyBreakdownScreenshot from '../../Screen Shot 2019-06-10 at 12.23.41 PM.png'

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
  timeSegmentLabels: Array<DensityTimeSegmentLabel>,
  onSaveReportModal: (object) => void,
  onCloseModal: () => void,
  onUpdateModal: (key: string, value: any) => void,
  // Causes the report to rerun calculations and rerender
  onReportSettingsUpdated: (DensityReport, invokeImmediately: boolean) => void,
  onReportModalMovedToReportConfigurationPage: (
    report: DensityReport,
    hierarchy: Array<SpaceHierarchyDisplayItem>,
  ) => void,
  onAddReportToDashboard: (DensityReport) => void,
  onReportShowDeletePopup: (DensityReport) => void,
};

const HEADER_REPORT = {
  component: null,
  calculations: null,
  metadata: {
    displayName: 'Header',
    description: 'A title that can be inserted above a set of reports.',
    controls: [],
    visible: true,
  },
};
const COLOR_LIST = [ 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'RED' ];

// Given a report, return any fields that are required but aren't filled in
function getEmptyRequiredFields(report) {
  if (report.type === 'HEADER') {
    return [];
  }
  return REPORTS[report.type].metadata.controls
    .filter(control => control.parameters.required)
    .filter(control => {
      const value = report.settings[changeCase.camel(control.parameters.field)];
      return !value || value.length === 0;
    });
}

function DashboardReportEditModal({
  activeModal,
  spaceHierarchy,
  reportList,
  reportsInSelectedDashboard,
  calculatedReportDataForPreviewedReport,
  timeSegmentLabels,

  onUpdateModal,
  onCloseModal,
  onSaveReportModal,
  onReportSettingsUpdated,
  onReportModalMovedToReportConfigurationPage,
  onAddReportToDashboard,
  onReportShowDeletePopup,
}: DashboardReportModalProps) {
  if (activeModal.name === 'REPORT_MODAL') {
    let selectedReportType = REPORTS[activeModal.data.report.type];
    if (activeModal.data.report.type === 'HEADER') {
      selectedReportType = HEADER_REPORT;
    }

    const formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy.data);

    const filterReportCollection = filterCollection({fields: ['name', 'displayType']});
    const filterReportTypeCollection = filterCollection({fields: ['displayName']});

    const requiredControlsThatAreEmpty = selectedReportType ? getEmptyRequiredFields(activeModal.data.report) : [];

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
        <div className={styles.reportModalWrapper}>
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
              <div className={styles.searchBar}>
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
                      (
                        [['HEADER', HEADER_REPORT], ...(Object.entries(REPORTS))]
                        .filter(([key, value]) => (value as any).metadata.visible)
                        .map(([key, value]) => ({ ...(value as any).metadata, id: key }))
                      ),
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
                {activeModal.data.report.type ? (
                  <Fragment>
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
                  </Fragment>
                ) : (
                  <p>No report selected</p>
                )}
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
                    required
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
                        onReportSettingsUpdated(report, false);
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
                      if (getEmptyRequiredFields(report).length === 0) {
                        onReportSettingsUpdated(report, false);
                      }
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
                          isItemDisabled={control.parameters.isSpaceItemDisabled}
                        />
                      );
                      break;
                    case 'TIME_SEGMENT_LABEL_PICKER':
                      input = (
                        control.parameters.canSelectMultiple ? (
                          <TagInput
                            choices={timeSegmentLabels.map(label => ({id: label, label}))}
                            tags={activeModal.data.report.settings[fieldName].map(label => ({id: label, label}))}
                            placeholder={'eg. "Whole Day"'}
                            emptyTagsPlaceholder="No time segments selected."
                            id={id}
                            width="100%"
                            canCreateTags={false}
                            onAddTag={tag => reportUpdateSettings(fieldName, [
                              ...activeModal.data.report.settings[fieldName],
                              tag.id,
                            ])}
                            onRemoveTag={tag => {
                              const labels = activeModal.data.report.settings[fieldName].filter(t => t !== tag.id);
                              reportUpdateSettings(fieldName, labels);
                            }}
                          />
                        ) : (
                          <InputBox
                            type="select"
                            choices={timeSegmentLabels.map(label => ({id: label, label}))}
                            placeholder={'eg. "Whole Day"'}
                            id={id}
                            width="100%"
                            value={activeModal.data.report.settings[fieldName]}
                            onChange={item => reportUpdateSettings(fieldName, item.id)}
                          />
                        )
                      );
                      break;
                    case 'TIME_SEGMENT_LABEL_PICKER_WITH_COLORS':
                      input = (
                        control.parameters.canSelectMultiple ? (
                          <TagInput
                            choices={timeSegmentLabels.map(label => ({id: label, label}))}
                            tags={activeModal.data.report.settings[fieldName].map(({label}) => ({id: label, label}))}
                            placeholder={'eg. "Whole Day"'}
                            emptyTagsPlaceholder="No time segments selected."
                            id={id}
                            width="100%"
                            canCreateTags={false}
                            onAddTag={tag => reportUpdateSettings(fieldName, [
                              ...activeModal.data.report.settings[fieldName],
                              {
                                label: tag.id,
                                color: COLOR_LIST[activeModal.data.report.settings[fieldName].length % COLOR_LIST.length],
                              },
                            ])}
                            onRemoveTag={tag => {
                              const labels = activeModal.data.report.settings[fieldName].filter(t => t.label !== tag.id);
                              reportUpdateSettings(fieldName, labels);
                            }}
                          />
                        ) : (
                          <InputBox
                            type="select"
                            choices={timeSegmentLabels.map(label => ({id: label, label}))}
                            placeholder={'eg. "Whole Day"'}
                            id={id}
                            width="100%"
                            value={activeModal.data.report.settings[fieldName]}
                            onChange={item => reportUpdateSettings(fieldName, item.id)}
                          />
                        )
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
                          ]}
                          onChange={choice => reportUpdateSettings(fieldName, choice.id)}
                        />
                      );
                      break;
                    case 'PERCENTAGE':
                      input = (
                        <Fragment>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={activeModal.data.report.settings[fieldName]}
                            onChange={e => {
                              const report = {
                                ...activeModal.data.report,
                                settings: {
                                  ...activeModal.data.report.settings,
                                  [fieldName]: e.target.value,
                                },
                              };
                              onUpdateModal('report', report);

                              // Called so that the report calculations can be rerun
                            }}
                            onMouseUp={() => onReportSettingsUpdated(activeModal.data.report, false)}
                          />
                          {Math.floor(activeModal.data.report.settings[fieldName] * 100)}%
                        </Fragment>
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
                        required={control.parameters.required}
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
                      <AppBarSection>
                        <Button
                          variant="underline"
                          type="muted"
                          onClick={() => onReportSettingsUpdated(activeModal.data.report, true)}
                          disabled={requiredControlsThatAreEmpty.length > 0}
                        >Refresh Report</Button>
                      </AppBarSection>
                    </AppBar>
                  </AppBarContext.Provider>
                  {requiredControlsThatAreEmpty.length === 0 ? (
                    <div className={styles.reportBackdrop}>
                      {calculatedReportDataForPreviewedReport.state === 'LOADING' ? (
                        <div className={styles.centered}>
                          <GenericLoadingState />
                        </div>
                      ) : (
                        <Report
                          report={activeModal.data.report}
                          reportData={calculatedReportDataForPreviewedReport}
                          onOpenReportExpandedModal={() => {}}
                        />
                      )}
                    </div>
                  ) : (
                    <p>These required controls have not been filled out: {requiredControlsThatAreEmpty.map(i => i.label).join(', ')}</p>
                  )}
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
                    onClick={() => onReportShowDeletePopup(activeModal.data.report)}
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
                        (
                          activeModal.data.page === PAGE_NEW_REPORT_CONFIGURATION &&
                          activeModal.data.report.name.length === 0
                        ) || requiredControlsThatAreEmpty.length > 0
                      }
                    >Save</Button>
                  ) : null}
                </ButtonGroup>
              </AppBarSection>
            </AppBar>
          </AppBarContext.Provider>
        </div>
      </Modal>
    );
  } else {
    return null;
  }
}

export default connect((state: any) => ({
  activeModal: state.activeModal,
  spaceHierarchy: state.spaceHierarchy,
  // List of all reports from the server (ie, the response of GET /v2/reports)
  reportList: state.dashboards.reportList,
  // List of all reports in the working copy of the selected dashboard
  // (ie, `report_set` from GET /v2/dashboards/:id)
  reportsInSelectedDashboard: state.dashboards.formState ? state.dashboards.formState.reportSet : [],
  calculatedReportDataForPreviewedReport: extractCalculatedReportDataFromDashboardsReducer(state.dashboards),
  timeSegmentLabels: state.dashboards.timeSegmentLabels,
}), dispatch => ({
  onUpdateModal(key, value) {
    dispatch<any>(updateModal({[key]: value}));
  },

  onReportModalMovedToReportConfigurationPage: (report, formattedHierarchy) => {
    // Set default parameters for a newly created report
    const reportType = report.type === 'HEADER' ? HEADER_REPORT : REPORTS[report.type];
    const initialReportSettings = reportType.metadata.controls.reduce((acc, control) => {
      const fieldName = changeCase.camel(control.parameters.field);

      let value;
      switch (control.type) {
      case 'SPACE_PICKER':
        if (control.parameters.canSelectMultiple) {
          value = (control.parameters.defaultValue || []).map(item => item.space.id);
        } else {
          const defaultSpace = (control.parameters.defaultValue || null);
          value = defaultSpace && defaultSpace.space ? defaultSpace.space.id : defaultSpace;
        }
        break;

      case 'TIME_RANGE_PICKER':
        value = control.parameters.defaultValue || 'LAST_WEEK'; // default fallback value
        break;

      case 'TIME_SEGMENT_LABEL_PICKER':
      case 'TIME_SEGMENT_LABEL_PICKER_WITH_COLORS':
        value = (
          control.parameters.defaultValue ||
          (control.parameters.canSelectMultiple ? [] : null) // default fallback value
        );
        break;

      case 'SELECT_BOX':
        value = (
          control.parameters.defaultValue ||
          (control.parameters.choices.length > 0 ? control.parameters.choices[0].id : false) ||
          null
        );
        break;

      case 'BOOLEAN':
        value = control.parameters.defaultValue || false;
        break;

      case 'PERCENTAGE':
        value = control.parameters.defaultValue || 0.5;
        break;

      case 'NUMBER':
        value = control.parameters.defaultValue || '';
        break;

      default:
        value = report.settings[fieldName] || control.parameters.defaultValue || '';
        break;
      }

      return { ...acc, [fieldName]: value };
    }, {});
    const reportWithInitialSettings = { ...report, settings: initialReportSettings };
    dispatch<any>(updateModal({ report: reportWithInitialSettings }));

    // Then perform the initial rendering of the report if all fields are filled in
    if (getEmptyRequiredFields(reportWithInitialSettings).length === 0) {
      dispatch<any>(rerenderReportInReportModal(reportWithInitialSettings));
    }
  },

  onReportSettingsUpdated: (() => {
    const debouncedUpdate = debounce(report => {
      dispatch<any>(rerenderReportInReportModal(report));
    }, 500);

    return (report, invokeImmediately?: boolean) => {
      if (invokeImmediately) {
        dispatch<any>(rerenderReportInReportModal(report));
      } else {
        debouncedUpdate(report);
      }
    };
  })(),
}))(DashboardReportEditModal);
