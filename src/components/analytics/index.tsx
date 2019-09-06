import React from 'react';
import styles from './styles.module.scss';

import AnalyticsControlBar from '../analytics-control-bar';
import AnalyticsTabs from '../analytics-tabs';

import { ResourceStatus, AnalyticsActionType } from '../../types/analytics';

import { RxReduxStore } from '../../rx-stores';
import AnalyticsStore from '../../rx-stores/analytics';
import useRxStore from '../../helpers/use-rx-store';
import useRxDispatch from '../../helpers/use-rx-dispatch';

import createReport from '../../rx-actions/analytics/create-report';

import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';

import {
  AppFrame,
  AppPane,
} from '@density/ui';

export default function Analytics() {
  const { spaces, spaceHierarchy, user } = useRxStore(RxReduxStore);
  const organizationalWeekStartDay = user.data.organization.settings.dashboardWeekStart || 'Sunday';

  const state = useRxStore(AnalyticsStore);
  const dispatch = useRxDispatch();

  const formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy.data);

  switch (state.status) {
  case ResourceStatus.IDLE:
    return (
      <p>Idle</p>
    );
  case ResourceStatus.LOADING:
    return (
      <p>Loading</p>
    );
  case ResourceStatus.ERROR:
    return (
      <p>Error</p>
    );
  case ResourceStatus.COMPLETE:
    const activeReport = state.data.activeReportId ? (
      state.data.reports.find(r => r.id === state.data.activeReportId)
    ) : null;
    return (
      <AppFrame>
        <AppPane>
          <div className={styles.analytics}>
            <AnalyticsTabs
              reports={state.data.reports}
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
              <AnalyticsControlBar
                metric={activeReport.selectedMetric}
                onChangeMetric={metric => dispatch({
                  type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_SELECTED_METRIC,
                  reportId: activeReport.id,
                  metric,
                })}
                filters={activeReport.query.filters}
                onChangeFilters={filters => dispatch({
                  type: AnalyticsActionType.ANALYTICS_REPORT_CHANGE_FILTERS,
                  reportId: activeReport.id,
                  filters,
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

                spaces={spaces.data}
                formattedHierarchy={formattedHierarchy}
              />
            ) : null}
            <pre style={{overflowY: 'auto', height: 600, background: '#eee', padding: 10}}>{JSON.stringify(state, null, 2)}</pre>
          </div>
        </AppPane>
      </AppFrame>
    );
  }
}
