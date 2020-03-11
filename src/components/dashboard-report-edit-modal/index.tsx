import React, { ReactNode, Fragment } from 'react';
import debounce from 'lodash/debounce';
import moment from 'moment';
import styles from './styles.module.scss';
import Report, { REPORTS } from '@density/reports';
import isOutsideRange from '../../helpers/date-range-picker-is-outside-range';
import getCommonRangesForSpace from '../../helpers/common-ranges';
import MarkdownEditor from '../markdown-editor/index';

import { CoreSpace, CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import { CoreTimeSegmentLabel } from '@density/lib-api-types/core-v2/time_segments';
import { DensityReport } from '../../types';

import {
  AppBar,
  AppBarTitle,
  AppBarSection,
  AppBarContext,
  Button,
  ButtonGroup,
  Icons,
  InputBox,
  ListView,
  ListViewColumn,
  TagInput,
  Modal,
  RadioButton,
  Switch,
  DateRangePicker,
  DateRangePickerContext,
} from '@density/ui/src';

import updateModal from '../../rx-actions/modal/update';
import {
  rerenderReportInReportModal,
  clearPreviewReportData,

  ReportModalPages,
  PAGE_PICK_SAVED_REPORT,
  PAGE_NEW_REPORT_TYPE,
  PAGE_NEW_REPORT_CONFIGURATION,

  ReportOperationType,
  OPERATION_CREATE,
  OPERATION_UPDATE,

  extractCalculatedReportDataFromDashboardsReducer,
} from '../../rx-actions/dashboards/report-modal';

import GenericLoadingState from '../generic-loading-state';
import { SpacePickerDropdown } from '../space-picker';
import FormLabel from '../form-label';

import { spaceHierarchyFormatter } from '@density/lib-space-helpers';
import filterCollection from '../../helpers/filter-collection';
import { TIME_ZONE_CHOICES } from '@density/lib-time-helpers';
import {
  formatForReactDates,
  parseFromReactDates,
  parseISOTimeAtSpace,
} from '../../helpers/space-time-utilities';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore, { ActiveModalState } from '../../rx-stores/active-modal';
import { getUserDashboardWeekStart } from '../../helpers/legacy';
import UserStore from '../../rx-stores/user';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import DashboardsStore from '../../rx-stores/dashboards';
import MiscellaneousStore from '../../rx-stores/miscellaneous';
import SpacesLegacyStore from '../../rx-stores/spaces-legacy';
import SpaceHierarchyStore from '../../rx-stores/space-hierarchy';
import { sanitizeReportSettings } from '../../helpers/casing';

type DashboardReportModalProps = {
  activeModal: ActiveModalState & {
    data: {
      page: ReportModalPages,
      operationType: ReportOperationType,
      report: DensityReport,
      pickSavedReportSelectedReportId: string | null,
      newReportReportTypeSearchString: string,
      reportListSearchString: string,
    },
  },
  spaces: {
    data: Array<CoreSpace>,
  },
  spaceHierarchy: {
    data: Array<CoreSpaceHierarchyNode>,
  },
  reportList: Array<DensityReport>,
  reportsInSelectedDashboard: Array<DensityReport>,
  calculatedReportDataForPreviewedReport: {
    state: string,
    data: any,
  },
  timeSegmentLabels: Array<CoreTimeSegmentLabel>,
  dashboardDate: string,
  dashboardWeekStart: string,
  onSaveReportModal: (object) => void,
  onCloseModal: () => void,
  onUpdateModal: (key: string, value: any) => void,
  // Causes the report to rerun calculations and rerender
  onReportSettingsUpdated: (
    report: DensityReport,
    dashboardDate: string,
    dashboardWeekStart: string,
    invokeImmediately: boolean,
  ) => void,
  onReportModalMovedToReportConfigurationPage: (
    report: DensityReport,
    dashboardDate: string,
    dashboardWeekStart: string,
  ) => void,
  onAddReportToDashboard: (DensityReport) => void,
  onReportShowDeletePopup: (DensityReport) => void,
  onRemoveReportFromDashboard: (DensityReport) => void,
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
      const value = report.settings[control.parameters.field];
      return !value || value.length === 0;
    });
}

function DashboardReportEditModal({
  spaces,
  activeModal,
  spaceHierarchy,
  reportList,
  reportsInSelectedDashboard,
  calculatedReportDataForPreviewedReport,
  timeSegmentLabels,
  dashboardDate,
  dashboardWeekStart,

  onUpdateModal,
  onCloseModal,
  onSaveReportModal,
  onReportSettingsUpdated,
  onReportModalMovedToReportConfigurationPage,
  onRemoveReportFromDashboard,
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
    const filteredReportList = filterReportCollection(
      reportList,
      activeModal.data.reportListSearchString,
    );

    const filterReportTypeCollection = filterCollection({fields: ['displayName', 'description']});

    const requiredControlsThatAreEmpty = selectedReportType ? getEmptyRequiredFields(activeModal.data.report) : [];

    let modalWidth = 960,
        modalHeight = 640;
    if (activeModal.data.page === PAGE_PICK_SAVED_REPORT) {
      modalWidth = 756;
    }
    // When editing a header, there isn't a sidebar so make the modal smaller.
    if (
      activeModal.data.page === PAGE_NEW_REPORT_CONFIGURATION &&
      activeModal.data.report.type === 'HEADER'
    ) {
      modalWidth = 640;
      modalHeight = 480;
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
                activeModal.data.page === PAGE_PICK_SAVED_REPORT ? (
                  'Add Saved Report to Dashboard'
                ) : `${activeModal.data.operationType === OPERATION_CREATE ? 'New' : 'Edit'} Report`
              }
            </AppBarTitle>
          </AppBar>

          {activeModal.data.page === PAGE_PICK_SAVED_REPORT ? (
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
                  <div className={styles.nonIdealState}>
                    <h4>No reports exist in your organization</h4>
                    <p>Create a new report to add data to your dashboard.</p>
                  </div>
                ) : (
                  filteredReportList.length === 0 ? (
                    <div className={styles.nonIdealState}>
                      <h4>No reports found matching "{activeModal.data.reportListSearchString}"</h4>
                    </div>
                  ) : (
                    <ListView data={filteredReportList}>
                      <ListViewColumn
                        id="Name"
                        width={320}
                        template={item => {
                          let reportType;
                          if (item.type === 'HEADER') {
                            reportType = 'Header';
                          } else {
                            reportType = REPORTS[item.type] ? REPORTS[item.type].metadata.displayName : item.type;
                          }

                          return (
                            <div className={styles.savedReportNameWrapper}>
                              <RadioButton
                                checked={item.id === activeModal.data.pickSavedReportSelectedReportId}
                                onChange={() => onUpdateModal('pickSavedReportSelectedReportId', item.id)}
                                // Cannot select reports that are already in the dashboard
                                disabled={Boolean(reportsInSelectedDashboard.find(report => report.id === item.id))}
                              />
                              <div className={styles.savedReportNameWrapperColumn}>
                                <h5>{item.name}</h5>
                                <span>{reportType}</span>
                              </div>
                            </div>
                          );
                        }}
                        onClick={item => {
                          if (!reportsInSelectedDashboard.find(report => report.id === item.id)) {
                            onUpdateModal('pickSavedReportSelectedReportId', item.id)
                          }
                        }}
                      />
                      <ListViewColumn
                        id="Spaces"
                        template={item => {
                          let space_ids: Array<string> = [];
                          if (item.settings.space_id) {
                            space_ids = [item.settings.space_id];
                          }
                          if (item.settings.space_ids) {
                            space_ids = item.settings.space_ids;
                          }

                          let spaceNames = space_ids.map(id => {
                            const match = formattedHierarchy.find(x => x.space.id === id);
                            return match ? match.space.name : null;
                          }).filter(x => x);

                          let spaceText = spaceNames.slice(0, 2).join(', ');
                          if (spaceNames.length > 2) {
                            spaceText += ` (+${spaceNames.length-2} more)`;
                          }

                          return (
                            <span className={styles.savedReportSpaces}>
                              {spaceText}
                            </span>
                          )
                        }}
                      />
                    </ListView>
                  )
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
                        Object.entries(REPORTS)
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
                          src={metadata.imageUrl}
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
                      <img
                        src={selectedReportType.metadata.imageUrl}
                        style={{maxHeight: 200, maxWidth: 540}}
                        alt=""
                      />
                    </div>
                    <p className={styles.reportFullDescription}>
                      {selectedReportType ? selectedReportType.metadata.description : null}
                    </p>
                  </Fragment>
                ) : (
                  <Fragment>
                    <AppBar />
                    <div className={styles.nonIdealState}>
                      <h4>No report type selected</h4>
                      <p>Select a report type on the left to create a report</p>
                    </div>
                  </Fragment>
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
                        onReportSettingsUpdated(report, dashboardDate, dashboardWeekStart, false);
                      }}
                    />}
                  />
                  {selectedReportType.metadata.controls.map(control => {
                    const id = `reports-control-${control.label.replace(' ', '-')}`;
                    const fieldName = control.parameters.field;
                    let input: ReactNode = null;

                    function reportUpdateSettings(key, value) {
                      const report = {
                        ...activeModal.data.report,
                        settings: sanitizeReportSettings({ ...activeModal.data.report.settings, [key]: value }),
                      };
                      onUpdateModal('report', report);

                      // Called so that the report calculations can be rerun
                      if (getEmptyRequiredFields(report).length === 0) {
                        onReportSettingsUpdated(report, dashboardDate, dashboardWeekStart, false);
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
                      const space = spaces.data.find(s => s.id === activeModal.data.report.settings.space_id);
                      input = (
                        control.parameters.canSelectMultiple ? (
                          <TagInput
                            choices={
                              timeSegmentLabels.filter(label => {
                                // If the report only allows selection of a single space, filter the
                                // list of time segment labels by that space.
                                if (!space) { return true; }
                                return (space as any).time_segments.find(tsm => tsm.label === label);
                              }).map(label => ({id: label, label}))
                            }
                            tags={activeModal.data.report.settings[fieldName].map(label => ({id: label, label}))}
                            placeholder={'eg. "Whole Day"'}
                            emptyTagsPlaceholder="No time segments selected."
                            id={id}
                            width="100%"
                            canCreateTags={false}
                            openDropdownOnFocus={true}
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
                            openDropdownOnFocus={true}
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
                      return (
                        <Fragment key={control.label}>

                          {/* The main time range selector */}
                          <FormLabel
                            label={control.label}
                            key={control.label}
                            htmlFor={id}
                            input={<InputBox
                              type="select"
                              id={id}
                              width="100%"
                              value={
                                activeModal.data.report.settings[fieldName].type ||
                                activeModal.data.report.settings[fieldName]
                              }
                              choices={[
                                {id: 'LAST_WEEK', label: 'Last Week' },
                                {id: 'LAST_4_WEEKS', label: 'Last 4 weeks' },
                                {id: 'WEEK_TO_DATE', label: 'Week to date' },
                                {id: 'LAST_7_DAYS', label: 'Last 7 days' },
                                {id: 'LAST_28_DAYS', label: 'Last 28 days' },
                                {id: 'CUSTOM_RANGE', label: 'Absolute time period...' },
                              ]}
                              onChange={choice => {
                                if (choice.id === 'CUSTOM_RANGE') {
                                  let displayTimeZone = 'America/New_York'; // Default value

                                  // Use a heuristic to try to guess what time zone should be
                                  // defaulted to.
                                  if (activeModal.data.report.settings.space_id) {
                                    const matchingSpace = spaces.data.find(
                                      space => space.id === activeModal.data.report.settings.space_id
                                    );
                                    if (matchingSpace) {
                                      displayTimeZone = matchingSpace.time_zone;
                                    }
                                  } else if (activeModal.data.report.settings.space_ids && activeModal.data.report.settings.space_ids.length > 0) {
                                    const matchingSpace = spaces.data.find(
                                      space => space.id === activeModal.data.report.settings.space_ids[0]
                                    );
                                    if (matchingSpace) {
                                      displayTimeZone = matchingSpace.time_zone;
                                    }
                                  }

                                  reportUpdateSettings(fieldName, {
                                    type: 'CUSTOM_RANGE',
                                    display_time_zone: displayTimeZone,
                                    start_date: moment.tz(displayTimeZone).subtract(7, 'days').startOf('day').format(),
                                    end_date: moment.tz(displayTimeZone).subtract(1, 'day').startOf('day').format(),
                                  });
                                } else {
                                  reportUpdateSettings(fieldName, choice.id);
                                }
                              }}
                            />}
                            required={control.parameters.required}
                          />

                          {/* If custom range was picked, show some other options */}
                          {activeModal.data.report.settings[fieldName].type === 'CUSTOM_RANGE' ? (
                            <Fragment>
                              <FormLabel
                                label="Date Range"
                                key={`${control.label} Date Range`}
                                htmlFor={id}
                                input={<DateRangePickerContext.Provider value="SMALL_WIDTH">
                                  <DateRangePicker
                                    startDate={formatForReactDates(
                                      moment.tz(
                                        activeModal.data.report.settings[fieldName].start_date,
                                        activeModal.data.report.settings[fieldName].display_time_zone,
                                      ),
                                      {time_zone: activeModal.data.report.settings[fieldName].display_time_zone},
                                    )}
                                    endDate={formatForReactDates(
                                      moment.tz(
                                        activeModal.data.report.settings[fieldName].end_date,
                                        activeModal.data.report.settings[fieldName].display_time_zone,
                                      ),
                                      {time_zone: activeModal.data.report.settings[fieldName].display_time_zone},
                                    )}
                                    onChange={({startDate, endDate}) => {
                                      if (startDate) {
                                        startDate = parseFromReactDates(startDate, {
                                          time_zone: activeModal.data.report.settings[fieldName].display_time_zone,
                                        }).startOf('day');
                                      } else {
                                        startDate = parseISOTimeAtSpace(
                                          activeModal.data.report.settings[fieldName].start_date,
                                          {
                                            time_zone: activeModal.data.report.settings[fieldName].display_time_zone,
                                          }
                                        );
                                      }
                                      if (endDate) {
                                        endDate = parseFromReactDates(endDate, {
                                          time_zone: activeModal.data.report.settings[fieldName].display_time_zone,
                                        }).endOf('day');
                                      } else {
                                        endDate = parseISOTimeAtSpace(
                                          activeModal.data.report.settings[fieldName].end_date,
                                          {
                                            time_zone: activeModal.data.report.settings[fieldName].display_time_zone,
                                          }
                                        );
                                      }

                                      reportUpdateSettings(fieldName, {
                                        ...activeModal.data.report.settings[fieldName],
                                        start_date: startDate.format(),
                                        end_date: endDate.format(),
                                      });
                                    }}
                                    isOutsideRange={day => isOutsideRange({
                                      time_zone: activeModal.data.report.settings[fieldName].display_time_zone,
                                    }, day)}
                                    // Within the component, store if the user has selected the start of end date picker
                                    // input
                                    focusedInput={activeModal.data.report.settings[fieldName].date_picker_input}
                                    onFocusChange={(focused, a) => {
                                      reportUpdateSettings(fieldName, {
                                        ...activeModal.data.report.settings[fieldName],
                                        date_picker_input: focused,
                                      });
                                    }}
                                    commonRanges={getCommonRangesForSpace({
                                      time_zone: activeModal.data.report.settings[fieldName].display_time_zone,
                                    })}
                                    onSelectCommonRange={({startDate, endDate}) => {
                                      reportUpdateSettings(fieldName, {
                                        ...activeModal.data.report.settings[fieldName],
                                        start_date: startDate.format(),
                                        end_date: endDate.format(),
                                      });
                                    }}
                                  />
                                </DateRangePickerContext.Provider>}
                                required={control.parameters.required}
                              />
                              <FormLabel
                                label="Time Zone"
                                key={`${control.label} Time Zone`}
                                htmlFor={id}
                                input={<InputBox
                                  type="select"
                                  choices={TIME_ZONE_CHOICES}
                                  menuMaxHeight={300}
                                  width="100%"
                                  value={activeModal.data.report.settings[fieldName].display_time_zone}
                                  onChange={choice => {
                                    reportUpdateSettings(fieldName, {
                                      ...activeModal.data.report.settings[fieldName],
                                      display_time_zone: choice.id,
                                    });
                                  }}
                                />}
                                required={control.parameters.required}
                              />
                            </Fragment>
                          ) : null}
                        </Fragment>
                      );

                    case 'PERCENTAGE':
                      input = (
                        <div className={styles.percentageRange}>
                          <input
                            type="range"
                            className={styles.percentageRangeBar}
                            min={0}
                            max={1}
                            step={0.05}
                            value={activeModal.data.report.settings[fieldName]}
                            onChange={e => {
                              const report = {
                                ...activeModal.data.report,
                                settings: {
                                  ...activeModal.data.report.settings,
                                  [fieldName]: parseFloat(e.target.value),
                                },
                              };
                              onUpdateModal('report', report);
                            }}
                            onMouseUp={() => onReportSettingsUpdated(activeModal.data.report, dashboardDate, dashboardWeekStart, false)}
                          />
                          <div className={styles.percentageRangeLabel}>
                            {Math.floor(activeModal.data.report.settings[fieldName] * 100)}%
                          </div>
                        </div>
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

                    case 'MARKDOWN':
                      input = (
                        <MarkdownEditor
                          id={id}
                          width="100%"
                          value={activeModal.data.report.settings[fieldName]}
                          onChange={e => {
                            reportUpdateSettings(fieldName, e.target.value);
                          }}
                        />
                      );
                      break;

                    case 'INSIGHT_LIST':
                      const markdownList = activeModal.data.report.settings[fieldName] || [];
                      input = (
                        <Fragment>
                          <em style={{marginBottom: 8, fontSize: 14}}>
                            To define multiple insights, put each on a new line.
                          </em>
                          <MarkdownEditor
                            id={id}
                            width="100%"
                            value={markdownList.join('\n')}
                            onChange={e => {
                              reportUpdateSettings(fieldName, (e.target.value || '').split('\n'));
                            }}
                          />
                        </Fragment>
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
                          min={control.parameters.minimum}
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
                          onClick={() => onReportSettingsUpdated(
                            activeModal.data.report,
                            dashboardDate,
                            dashboardWeekStart,
                            true,
                          )}
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
                          displayContext={{showExpandControl: false}}
                        />
                      )}
                    </div>
                  ) : (
                    <div className={styles.nonIdealState}>
                      <h4>Required fields are empty</h4>
                      <p>
                        Please enter data into these fields:{' '}
                        {
                          requiredControlsThatAreEmpty
                            .map(i => <span className={styles.nonIdealStateListItem}>{i.label}</span>)
                            .reduce((acc, i, index) => index === requiredControlsThatAreEmpty.length - 1 ? (
                              <Fragment>{acc}, and {i}</Fragment>
                            ) : (
                              <Fragment>{acc}, {i}</Fragment>
                            ))
                        }
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          <AppBarContext.Provider value="BOTTOM_ACTIONS">
            <AppBar>
              <AppBarSection>
                {activeModal.data.operationType === OPERATION_UPDATE ? (
                  <ButtonGroup>
                    <Button
                      type="muted"
                      onClick={() => onRemoveReportFromDashboard(activeModal.data.report)}
                    >Remove from dashboard</Button>
                    <Button
                      variant="underline"
                      type="danger"
                      onClick={() => onReportShowDeletePopup(activeModal.data.report)}
                    >Delete</Button>
                  </ButtonGroup>
                ) : null}
              </AppBarSection>
              <AppBarSection>
                <ButtonGroup>
                  <Button
                    variant="underline"
                    onClick={onCloseModal}
                  >Cancel</Button>
                  {activeModal.data.page === PAGE_NEW_REPORT_CONFIGURATION && activeModal.data.operationType === OPERATION_CREATE ? (
                    <Button onClick={() => onUpdateModal('page', PAGE_NEW_REPORT_TYPE)}>Back</Button>
                  ) : null}
                  {activeModal.data.page === PAGE_PICK_SAVED_REPORT ? (
                    <Button
                      variant="filled"
                      width={65}
                      disabled={
                        activeModal.data.page === PAGE_PICK_SAVED_REPORT &&
                        !activeModal.data.pickSavedReportSelectedReportId
                      }
                      onClick={() => {
                        const report = reportList.find(
                          r => r.id === activeModal.data.pickSavedReportSelectedReportId
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
                          dashboardDate,
                          dashboardWeekStart,
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

// Helper to debounce report updating
// TODO: Handle this with RxJS streams!
const debouncedReportUpdate = debounce((dispatch, report, dashboardDate, dashboardWeekStart) => {
  rerenderReportInReportModal(
    dispatch,
    report,
    dashboardDate,
    dashboardWeekStart
  );
}, 500);


// FIXME: figure out what external props are required
const ConnectedDashboardReportEditModal: React.FC<Any<FixInRefactor>> = (externalProps) => {

  const dispatch = useRxDispatch();

  const user = useRxStore(UserStore);
  const spaces = useRxStore(SpacesLegacyStore);
  const spaceHierarchy = useRxStore(SpaceHierarchyStore);
  const activeModal = useRxStore(ActiveModalStore);
  const dashboards = useRxStore(DashboardsStore);
  const miscellaneous = useRxStore(MiscellaneousStore);

  const dashboardWeekStart = getUserDashboardWeekStart(user);

  // List of all reports from the server (ie, the response of GET /v2/reports)
  const reportList = dashboards.reportList;
  // List of all reports in the working copy of the selected dashboard
  // (ie, `report_set` from GET /v2/dashboards/:id)
  const reportsInSelectedDashboard = dashboards.formState ? dashboards.formState.report_set : [];
  const timeSegmentLabels = dashboards.timeSegmentLabels;
  const calculatedReportDataForPreviewedReport = extractCalculatedReportDataFromDashboardsReducer(dashboards)

  // Needed for rendering the report
  const dashboardDate = miscellaneous.dashboardDate;

  const onUpdateModal = (key, value) => {
    updateModal(dispatch, {[key]: value})
  }

  const onReportModalMovedToReportConfigurationPage = (report, dashboardDate, dashboardWeekStart) => {
    // Set default parameters for a newly created report
    const reportType = report.type === 'HEADER' ? HEADER_REPORT : REPORTS[report.type];
    const initialReportSettings = reportType.metadata.controls.reduce((acc, control) => {
      const fieldName = control.parameters.field;

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

      case 'INSIGHT_LIST':
        value = control.parameters.defaultValue || [];
        break;

      default:
        value = control.parameters.defaultValue || '';
        break;
      }

      return { ...acc, [fieldName]: value };
    }, {});
    const reportWithInitialSettings = { ...report, settings: initialReportSettings };

    // Reset report data back to LOADING state, this is done so that when the a new report type is
    // immediately loaded its not trying to render it with report data made for a different type of
    // report
    clearPreviewReportData(dispatch);

    updateModal(dispatch, { report: reportWithInitialSettings });

    if (getEmptyRequiredFields(reportWithInitialSettings).length === 0) {
      rerenderReportInReportModal(
        dispatch,
        reportWithInitialSettings,
        dashboardDate,
        dashboardWeekStart
      );
    }
  }
  const onReportSettingsUpdated = (report, dashboardDate, dashboardWeekStart, invokeImmediately) => {
    if (invokeImmediately) {
      rerenderReportInReportModal(
        dispatch,
        report,
        dashboardDate,
        dashboardWeekStart
      );
    } else {
      debouncedReportUpdate(
        dispatch,
        report,
        dashboardDate,
        dashboardWeekStart
      );
    }
  }

  return (
    <DashboardReportEditModal

      {...externalProps}

      spaces={spaces}
      spaceHierarchy={spaceHierarchy}
      activeModal={activeModal}
      reportList={reportList}
      reportsInSelectedDashboard={reportsInSelectedDashboard}
      timeSegmentLabels={timeSegmentLabels}
      calculatedReportDataForPreviewedReport={calculatedReportDataForPreviewedReport}
      dashboardWeekStart={dashboardWeekStart}
      dashboardDate={dashboardDate}
      onUpdateModal={onUpdateModal}
      onReportModalMovedToReportConfigurationPage={onReportModalMovedToReportConfigurationPage}
      onReportSettingsUpdated={onReportSettingsUpdated}
    />
  )
}

export default ConnectedDashboardReportEditModal;
