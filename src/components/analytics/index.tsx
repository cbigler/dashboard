import React, { Fragment, useState, useEffect } from 'react';
import styles from './styles.module.scss';
import startCase from 'lodash/startCase';
import * as d3Array from 'd3-array';

import AnalyticsControlBar, { AnalyticsControlBarSaveButtonState } from '../analytics-control-bar';
import AnalyticsTabs from '../analytics-tabs';
import AnalyticsSkeleton from '../analytics-skeleton';
import AnalyticsLineChart from '../analytics-line-chart';
import AnalyticsTable from '../analytics-table';
import AnalyticsHome from '../analytics-home';
import GenericErrorState from '../generic-error-state';

import { DensitySpace, DensitySpaceFunction, DaysOfWeek, DensitySpaceHierarchyItem, DensityUser } from '../../types';
import {
  ResourceStatus,
  AnalyticsActionType,
  QuerySelectionType,
  SpaceSelection,
  AnalyticsFocusedMetric,
  AnalyticsReport,
  QueryInterval,
} from '../../types/analytics';
import { DATE_RANGES, realizeDateRange } from '../../helpers/space-time-utilities';
import { groupBy } from '../../helpers/array-utilities';

import { RxReduxStore, ReduxState } from '../../rx-stores';
import AnalyticsStore from '../../rx-stores/analytics';
import useRxStore from '../../helpers/use-rx-store';
import useRxDispatch from '../../helpers/use-rx-dispatch';

import createReport from '../../rx-actions/analytics/create-report';
import openPartialReport from '../../rx-actions/analytics/open-partial-report';
import updateReport from '../../rx-actions/analytics/update-report';
import deleteReport from '../../rx-actions/analytics/delete-report';
import { isQueryRunnable } from '../../rx-stores/analytics';
import mixpanelTrack from '../../helpers/mixpanel-track';

// FIXME: The below should be switched to use the new rx-actinos based modal interface,
// point this out in a review!
import showModal from '../../actions/modal/show';

import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';

import { AppFrame, AppPane } from '@density/ui';

// FIXME: are all these space functions correct?? Point this out in a review!
export function spaceFunctionToRecommendedMetric(spaceFunction: DensitySpaceFunction): AnalyticsFocusedMetric {
  switch (spaceFunction) {
  case DensitySpaceFunction.CONFERENCE_ROOM:
  case DensitySpaceFunction.COLLABORATION:
  case DensitySpaceFunction.MEETING_ROOM:
  case DensitySpaceFunction.PHONE_BOOTH:
    return AnalyticsFocusedMetric.MAX;
  case DensitySpaceFunction.BREAK_ROOM:
  case DensitySpaceFunction.CAFE:
  case DensitySpaceFunction.EVENT_SPACE:
  case DensitySpaceFunction.FOCUS_QUIET:
  case DensitySpaceFunction.GYM:
  case DensitySpaceFunction.LOUNGE:
  case DensitySpaceFunction.RESTROOM:
  case DensitySpaceFunction.KITCHEN:
  case DensitySpaceFunction.LIBRARY:
  case DensitySpaceFunction.THEATER:
  case DensitySpaceFunction.WELLNESS_ROOM:
    return AnalyticsFocusedMetric.ENTRANCES;
  // case DensitySpaceFunction.OFFICE:
  // case DensitySpaceFunction.RECEPTION:
  //   return AnalyticsFocusedMetric.UTILIZATION;
  default:
    return AnalyticsFocusedMetric.MAX;
  }
}

export function getRecommendedReports(spaces: DensitySpace[]): Array<Partial<AnalyticsReport>> {
  const byFunction: [DensitySpaceFunction | null, DensitySpace[]][] = groupBy<DensitySpace, DensitySpaceFunction | null>(spaces, d => d['function']);

  // filter out spaces with no function
  const byFunctionFiltered = ((
    byFunction.filter(([spaceFunction, spaces]) => spaceFunction !== null)
  ) as unknown) as [DensitySpaceFunction, DensitySpace[]][];
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
        } as SpaceSelection],
        filters: [],
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

export default function Analytics() {
  // NOTE: renaming these to more easily type assert their `data`, see below
  const {
    spaces: spacesState,
    spaceHierarchy: spaceHierarchyState,
    user: userState,
  } = useRxStore<ReduxState>(RxReduxStore);

  // FIXME: the redux store shape needs to be typed
  // for now, just trying to force some basic typing here via assertion...
  const spaces = spacesState.data as DensitySpace[]
  const spaceHierarchy = spaceHierarchyState.data as DensitySpaceHierarchyItem[]
  const user = userState.data as DensityUser

  // FIXME: settings.dashboardWeekStart should be typed as DaysOfWeek, not string
  const organizationalWeekStartDay: DaysOfWeek = user.organization.settings.dashboardWeekStart as DaysOfWeek || 'Sunday';

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
                  filters={
                    activeReport.query.selections
                    .filter(s => s.type === QuerySelectionType.SPACE) as Array<SpaceSelection>
                  }
                  onChangeFilters={selections => dispatch({
                    type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTIONS,
                    reportId: activeReport.id,
                    selections: selections.map(s => ({
                      type: QuerySelectionType.SPACE,
                      ...s,
                    })) as Array<SpaceSelection>,
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

                  spaces={spaces}
                  formattedHierarchy={formattedHierarchy}
                  saveButtonState={saveButtonState}
                  onSave={() => {
                    if (activeReport.isSaved) {
                      // Report already has been saved so a new name doesn't need to be provided.
                      updateReport(activeReport)
                    } else {
                      // Report has not been saved, so prompt the user for a name.

                      // FIXME: The below should be switched to use the new rx-actinos based modal interface,
                      // point this out in a review!
                      showModal('MODAL_PROMPT', {
                        title: `Save As...`,
                        placeholder: 'Enter a name for this report',
                        confirmText: 'Save',
                        callback: name => {
                          updateReport({...activeReport, name});
                        },
                      })(dispatch);
                    }
                  }}
                  onUpdateReportName={(name) => updateReport({ ...activeReport, name })}
                  refreshEnabled={activeReport.queryResult.status === ResourceStatus.COMPLETE}
                  onRefresh={() => dispatch({
                    type: AnalyticsActionType.ANALYTICS_REPORT_REFRESH,
                    reportId: activeReport.id,
                  })}
                  moreMenuVisible={activeReport.isSaved}
                />
                <div className={styles.analyticsBody}>
                  <AnalyticsLineChart
                    report={activeReport}
                    {...realizeDateRange(activeReport.query.dateRange, 'utc', {organizationalWeekStartDay})}
                  />
                  <AnalyticsTable
                    spaces={spaces}
                    analyticsReport={activeReport}
                    onChangeHiddenSpaceIds={hiddenSpaceIds => dispatch({
                      type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_HIDDEN_SPACES,
                      reportId: activeReport.id,
                      hiddenSpaceIds,
                    })}
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
                onUpdateReportName={(report, name) => updateReport({ ...report, name })}
                onDeleteReport={report => deleteReport(report)}
              />
            )}
          </div>
        </AppPane>
      </AppFrame>
    );
  }
}

