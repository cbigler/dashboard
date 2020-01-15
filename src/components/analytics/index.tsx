import React, { Fragment, useState, useEffect } from 'react';
import styles from './styles.module.scss';
import startCase from 'lodash/startCase';
import * as d3Array from 'd3-array';
import getInObject from 'lodash/get';

import AnalyticsControlBar, { AnalyticsControlBarSaveButtonState } from '../analytics-control-bar';
import AnalyticsTabs from '../analytics-tabs';
import AnalyticsSkeleton from '../analytics-skeleton';
import AnalyticsChart from '../analytics-chart';
import AnalyticsTable from '../analytics-table';
import AnalyticsHome from '../analytics-home';
import GenericErrorState from '../generic-error-state';

import { CoreSpaceHierarchyNode } from '@density/lib-api-types/core-v2/spaces';
import { CoreSpace, CoreSpaceFunction } from '@density/lib-api-types/core-v2/spaces';
import { AnalyticsActionType } from '../../rx-actions/analytics';
import {
  ResourceStatus,
  QuerySelection,
  AnalyticsFocusedMetric,
  AnalyticsReport,
  QueryInterval,
  QuerySelectionType,
  SortDirection,
  TableColumn,
  nextSortDirection,
  AnalyticsDataExportType,
} from '../../types/analytics';
import { DATE_RANGES } from '../../helpers/space-time-utilities';
import { groupBy } from '../../helpers/array-utilities';

import AnalyticsStore from '../../rx-stores/analytics';
import useRxStore from '../../helpers/use-rx-store';
import useRxDispatch from '../../helpers/use-rx-dispatch';

import createReport from '../../rx-actions/analytics/operations/create-report';
import openPartialReport from '../../rx-actions/analytics/operations/open-partial-report';
import updateReport from '../../rx-actions/analytics/operations/update-report';
import deleteReport from '../../rx-actions/analytics/operations/delete-report';
import { isQueryRunnable } from '../../rx-stores/analytics';
import mixpanelTrack from '../../helpers/tracking/mixpanel-track';

import showModal from '../../rx-actions/modal/show';

import { spaceHierarchyFormatter } from '@density/lib-space-helpers';

import { AppFrame, AppPane } from '@density/ui/src';
import UserStore from '../../rx-stores/user';
import SpacesStore from '../../rx-stores/spaces';
import SpaceHierarchyStore from '../../rx-stores/space-hierarchy';
import { getUserDashboardWeekStart } from '../../helpers/legacy';
import { AnalyticsFeatureFlagsContext } from '../../helpers/analytics-feature-flags';

export function spaceFunctionToRecommendedMetric(spaceFunction: CoreSpaceFunction): AnalyticsFocusedMetric {
  switch (spaceFunction) {
  case CoreSpaceFunction.CONFERENCE_ROOM:
  case CoreSpaceFunction.COLLABORATION:
  case CoreSpaceFunction.MEETING_ROOM:
  case CoreSpaceFunction.PHONE_BOOTH:
    return AnalyticsFocusedMetric.MAX;
  case CoreSpaceFunction.BREAK_ROOM:
  case CoreSpaceFunction.CAFE:
  case CoreSpaceFunction.EVENT_SPACE:
  case CoreSpaceFunction.FOCUS_QUIET:
  case CoreSpaceFunction.GYM:
  case CoreSpaceFunction.LOUNGE:
  case CoreSpaceFunction.RESTROOM:
  case CoreSpaceFunction.KITCHEN:
  case CoreSpaceFunction.LIBRARY:
  case CoreSpaceFunction.THEATER:
  case CoreSpaceFunction.WELLNESS_ROOM:
    return AnalyticsFocusedMetric.ENTRANCES;
  // case CoreSpaceFunction.OFFICE:
  // case CoreSpaceFunction.RECEPTION:
  //   return AnalyticsFocusedMetric.UTILIZATION;
  default:
    return AnalyticsFocusedMetric.MAX;
  }
}

export function getRecommendedReports(spaces: CoreSpace[]): Array<Partial<AnalyticsReport>> {
  const byFunction: [CoreSpaceFunction | null, CoreSpace[]][] = groupBy<CoreSpace, CoreSpaceFunction | null>(spaces, d => d['function']);

  // filter out spaces with no function
  const byFunctionFiltered = ((
    byFunction.filter(([spaceFunction, spaces]) => spaceFunction !== null)
  ) as unknown) as [CoreSpaceFunction, CoreSpace[]][];
  return byFunctionFiltered
    // sort function groups descending by number of spaces
    .sort((a, b) => d3Array.descending(a[1].length, b[1].length))
    .map(([spaceFunction, spaces]): Partial<AnalyticsReport> => ({
      name: `${startCase(spaceFunction)} Summary`,
      query: {
        dateRange: DATE_RANGES.LAST_MONTH,
        interval: QueryInterval.ONE_DAY,
        selections: [{
          type: QuerySelectionType.SPACE,
          field: 'function',
          values: [ spaceFunction ],
        }],
      },
      selectedMetric: spaceFunctionToRecommendedMetric(spaceFunction),
    }));
}


// FIXME: we need a localStorage abstraction, this is madness
const INTRO_DISMISSED_LOCALSTORAGE_KEY = 'analyticsBetaIntroSplashDismissed'
const INTRO_DISMISSED_LOCALSTORAGE_SPECIAL_VALUE = 'yes'
const getInitialIntroVisibleState = () => {
  const rawStorageValue = localStorage.getItem(INTRO_DISMISSED_LOCALSTORAGE_KEY);
  if (rawStorageValue === INTRO_DISMISSED_LOCALSTORAGE_SPECIAL_VALUE) {
    return false
  }
  return true;
}
const saveDismissalOfIntroToStorage = () => {
  localStorage.setItem(
    INTRO_DISMISSED_LOCALSTORAGE_KEY,
    INTRO_DISMISSED_LOCALSTORAGE_SPECIAL_VALUE,
  )
}

function mapSpacesById(spaces: CoreSpace[]): ReadonlyMap<string, CoreSpace> {
  const map = new Map();
  spaces.forEach(space => {
    map.set(space.id, space);
  })
  return map;
}

export default function Analytics() {
  
  const userState = useRxStore(UserStore);
  const spacesState = useRxStore(SpacesStore);
  const spaceHierarchyState = useRxStore(SpaceHierarchyStore);

  // for now, just trying to force some basic typing here via assertion...
  const spaces = spacesState.data
  const spaceHierarchy = spaceHierarchyState.data as CoreSpaceHierarchyNode[]

  const spacesById = mapSpacesById(spaces);
  
  const user = userState.data;

  // FIXME: helping the typings along for now...
  if (!user) {
    throw new Error('This should not be possible')
  }

  // incredible fumble, these flags coming from core are all strings eg. 'true' or 'false', wow
  const opportunityMetricEnabledString = getInObject(user.organization, 'settings.opportunity_metric_enabled', 'false');
  const opportunityMetricEnabled: boolean = opportunityMetricEnabledString === 'true';

  const organizationalWeekStartDay = getUserDashboardWeekStart(userState);

  const state = useRxStore(AnalyticsStore);
  const dispatch = useRxDispatch();

  // Show an alert if the user is trying to close the tab and a report hasn't been saved
  useEffect(() => {
    function beforeUnloadCallback(e) {
      if (state.status !== ResourceStatus.COMPLETE) { return; }

      if (state.data.reports.length > 0 && !state.data.reports.filter(r => r.isOpen).every(r => r.isSaved)) {
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
      }
    }
    window.addEventListener('beforeunload', beforeUnloadCallback);
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadCallback);
    };
  }, [state])

  const [introVisible, setIntroVisible] = useState(getInitialIntroVisibleState());

  const onDismissIntro = () => {
    saveDismissalOfIntroToStorage();
    setIntroVisible(false);
  }

  const formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy);

  switch (state.status) {
  case ResourceStatus.IDLE:
    return (
      <p>Idle</p>
    );
  case ResourceStatus.LOADING:
    return (
      <AnalyticsSkeleton />
    );
  case ResourceStatus.ERROR:
    return (
      <div className={styles.centered}>
        <GenericErrorState />
      </div>
    );
  case ResourceStatus.COMPLETE:
    const activeReport = state.data.activeReportId ? (
      state.data.reports.find(r => r.id === state.data.activeReportId)
    ) : null;

    let saveButtonState = AnalyticsControlBarSaveButtonState.NORMAL;
    if (activeReport && !isQueryRunnable(activeReport.query)) {
      saveButtonState = AnalyticsControlBarSaveButtonState.DISABLED;
    } else if (activeReport && activeReport.isCurrentlySaving) {
      saveButtonState = AnalyticsControlBarSaveButtonState.LOADING;
    }

    return (
      <AnalyticsFeatureFlagsContext.Provider value={{opportunityMetricEnabled}}>
        <AppFrame>
          <AppPane>
            <div className={styles.analytics}>
              <AnalyticsTabs
                reports={state.data.reports.filter(r => r.isOpen)}
                activeReportId={state.data.activeReportId}
                onChangeActiveReport={reportId => dispatch({
                  type: AnalyticsActionType.ANALYTICS_FOCUS_REPORT,
                  reportId,
                })}
                onCloseReport={reportId => dispatch({
                  type: AnalyticsActionType.ANALYTICS_CLOSE_REPORT,
                  reportId,
                })}
                onAddNewReport={() => createReport(dispatch)}
              />
              {activeReport ? (
                <Fragment>
                  <AnalyticsControlBar

                    userState={userState}
                    metric={activeReport.selectedMetric}
                    onChangeMetric={metric => {
                      mixpanelTrack('Analytics Switched Metric Selection', {
                        'Old Metric': activeReport.selectedMetric,
                        'New Metric': metric,
                      });
                      dispatch({
                        type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTED_METRIC,
                        reportId: activeReport.id,
                        metric,
                      });
                    }}
                    opportunityCostPerPerson={activeReport.opportunityCostPerPerson}
                    onChangeOpportunityCostPerPerson={(opportunityCostPerPerson: number) => {
                      dispatch({
                        type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_OPPORTUNITY_PARAMETERS,
                        reportId: activeReport.id,
                        opportunityCostPerPerson,
                      })
                    }}
                    selections={activeReport.query.selections.filter(s => s.type === 'SPACE')}
                    onChangeSelections={selections => dispatch({
                      type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTIONS,
                      reportId: activeReport.id,
                      selections: selections.map(s => ({
                        type: 'SPACE',
                        ...s,
                      })) as Array<QuerySelection>,
                    })}

                    interval={activeReport.query.interval}
                    onChangeInterval={interval => dispatch({
                      type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_INTERVAL,
                      reportId: activeReport.id,
                      interval,
                    })}

                    dateRange={activeReport.query.dateRange}
                    onChangeDateRange={dateRange => {
                      if (dateRange === null) { return; }
                      dispatch({
                        type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_DATE_RANGE,
                        reportId: activeReport.id,
                        dateRange,
                        organizationalWeekStartDay,
                      });
                    }}

                    timeFilter={activeReport.query.timeFilter}
                    onChangeTimeFilter={timeFilter => {
                      dispatch({
                        type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_TIME_FILTER,
                        reportId: activeReport.id,
                        timeFilter,
                      })
                    }}

                    spaces={spaces}
                    formattedHierarchy={formattedHierarchy}

                    onRequestDataExport={(exportType: AnalyticsDataExportType) => {
                      if (activeReport.queryResult.status !== ResourceStatus.COMPLETE) return;
                      if (exportType === AnalyticsDataExportType.BOTH || exportType ===  AnalyticsDataExportType.TIME_SERIES) {
                        dispatch({
                          type: AnalyticsActionType.ANALYTICS_REQUEST_CHART_DATA_EXPORT,
                          datapoints: activeReport.queryResult.data.datapoints,
                          interval: activeReport.query.interval,
                          selectedMetric: activeReport.selectedMetric,
                          hiddenSpaceIds: activeReport.hiddenSpaceIds,
                        })
                      }
                      if (exportType === AnalyticsDataExportType.BOTH || exportType === AnalyticsDataExportType.SUMMARY) {
                        dispatch({
                          type: AnalyticsActionType.ANALYTICS_REQUEST_TABLE_DATA_EXPORT,
                          report: activeReport,
                          spaces: spaces,
                        })
                      }
                    }}

                    saveButtonState={saveButtonState}
                    onSave={() => {
                      if (activeReport.isSaved) {
                        // Report already has been saved so a new name doesn't need to be provided.
                        updateReport(dispatch, activeReport)
                      } else {
                        // Report has not been saved, so prompt the user for a name.

                        // FIXME: The below should be switched to use the new rx-actinos based modal interface,
                        // point this out in a review!
                        showModal(dispatch, 'MODAL_PROMPT', {
                          title: `Save As...`,
                          placeholder: 'Enter a name for this report',
                          confirmText: 'Save',
                          callback: name => {
                            updateReport(dispatch, {...activeReport, name});
                          },
                        });
                      }
                    }}

                    reportName={activeReport.name}
                    onUpdateReportName={(name) => updateReport(dispatch, { ...activeReport, name })}

                    refreshEnabled={activeReport.queryResult.status === ResourceStatus.COMPLETE}
                    onRefresh={() => dispatch({
                      type: AnalyticsActionType.ANALYTICS_REPORT_REFRESH,
                      reportId: activeReport.id,
                    })}
                    moreMenuVisible={activeReport.isSaved}
                  />
                  <div className={styles.analyticsBody}>
                    <AnalyticsChart
                      report={activeReport}
                      spacesById={spacesById}
                    />
                    <AnalyticsTable
                      spaces={spaces}
                      analyticsReport={activeReport}
                      onClickColumnHeader={(column: TableColumn) => {
                        let direction: SortDirection;
                        if (column === activeReport.columnSort.column) {
                          direction = nextSortDirection(activeReport.columnSort.direction);
                        } else {
                          direction = nextSortDirection(SortDirection.NONE);
                        }
                        dispatch({
                          type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_COLUMN_SORT,
                          reportId: activeReport.id,
                          column,
                          direction,
                        })
                      }}
                      onChangeHiddenSpaceIds={(hiddenSpaceIds) => {
                        dispatch({
                          type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_HIDDEN_SPACES,
                          reportId: activeReport.id,
                          hiddenSpaceIds,
                        })
                      }}
                      onChangeHighlightedSpaceId={(highlightedSpaceId) => {
                        dispatch({
                          type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_HIGHLIGHTED_SPACE,
                          reportId: activeReport.id,
                          highlightedSpaceId,
                        })
                      }}
                    />
                  </div>
                </Fragment>
              ) : (
                <AnalyticsHome
                  user={user}
                  reports={state.data.reports}
                  recommendedReports={getRecommendedReports(spaces)}
                  introVisible={introVisible}
                  // FIXME: I think `isVisible` below can only be false, so this is misleading
                  onChangeIntroVisible={(isVisible) => {
                    if (!isVisible) onDismissIntro();
                  }}
                  onCreateReport={() => createReport(dispatch)}
                  onOpenReport={report => dispatch({ type: AnalyticsActionType.ANALYTICS_OPEN_REPORT, report })}
                  onOpenPartialReport={partialReport => {
                    mixpanelTrack('Analytics Click Recommended Report', {
                      'Location': 'Home',
                      'Recommended Report Name': partialReport.name,
                    });
                    openPartialReport(dispatch, partialReport);
                  }}
                  onUpdateReportName={(report, name) => updateReport(dispatch, { ...report, name })}
                  onDeleteReport={report => deleteReport(dispatch, report)}
                />
              )}
            </div>
          </AppPane>
        </AppFrame>
      </AnalyticsFeatureFlagsContext.Provider>
    );
  }
}

