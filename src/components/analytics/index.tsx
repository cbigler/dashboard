import React, { useState } from 'react';
import styles from './styles.module.scss';

import AnalyticsControlBar from '../analytics-control-bar';
import AnalyticsTabs from '../analytics-tabs';
import AnalyticsSkeleton from '../analytics-skeleton';
import GenericErrorState from '../generic-error-state';

import {
  ResourceStatus,
  AnalyticsActionType,
  QuerySelectionType,
  SpaceSelection,
} from '../../types/analytics';

import { RxReduxStore } from '../../rx-stores';
import AnalyticsStore from '../../rx-stores/analytics';
import useRxStore from '../../helpers/use-rx-store';
import useRxDispatch from '../../helpers/use-rx-dispatch';

import createReport from '../../rx-actions/analytics/create-report';

import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';
import analyticsIntroImage from '../../assets/images/analytics-intro.svg';

import {
  AppFrame,
  AppPane,
  Button,
  Icons,
} from '@density/ui';
import colorVariables from '@density/ui/variables/colors.json';

export default function Analytics() {
  const { spaces, spaceHierarchy, user } = useRxStore(RxReduxStore);
  const organizationalWeekStartDay = user.data.organization.settings.dashboardWeekStart || 'Sunday';

  const state = useRxStore(AnalyticsStore);
  const dispatch = useRxDispatch();

  const [introVisible, setIntroVisible] = useState(true);

  const formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy.data);

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

                spaces={spaces.data}
                formattedHierarchy={formattedHierarchy}
              />
            ) : (
              <AnalyticsHomePage
                introVisible={introVisible}
                onChangeIntroVisible={setIntroVisible}
                onCreateReport={() => createReport(dispatch)}
              />
            )}
            <pre style={{overflowY: 'auto', height: 600, background: '#eee', padding: 10}}>{JSON.stringify(state, null, 2)}</pre>
          </div>
        </AppPane>
      </AppFrame>
    );
  }
}

function AnalyticsHomePage({introVisible, onChangeIntroVisible, onCreateReport}) {
  return (
    <div className={styles.home}>
      <div className={styles.homeMain}>
        {introVisible ? (
          <div className={styles.analyticsIntro}>
            <div className={styles.analyticsIntroLeft}>
              <h1>Analytics<sup>BETA</sup></h1>
              <p>A new way to explore your Density data and gain deeper insights into your portfolio.</p>
            </div>
            <div className={styles.analyticsIntroRight}>
              <Button onClick={() => onChangeIntroVisible(false)} variant="underline" type="muted">
                <div className={styles.dismissButton}>
                  <Icons.VisibilityHide />
                  <span className={styles.dismissButtonText}>Dismiss</span>
                </div>
              </Button>
            </div>
            <img alt="" className={styles.analyticsIntroImage} src={analyticsIntroImage} />
          </div>
        ) : null}

        <h2 className={styles.homeHeader}>
          <span className={styles.homeHeaderIcon}><Icons.Save color={colorVariables.brandPrimary} /></span>
          Saved Reports
        </h2>

        <div className={styles.homeEmpty}>
          <p>You haven't created any reports yet. Create a new report to get started.</p>
          <Button onClick={onCreateReport}>Create a Report</Button>
        </div>
      </div>
      <div className={styles.homeRecommended}>
        <h2 className={styles.homeHeader}>
          <span className={styles.homeHeaderIcon}><Icons.Lightning /></span>
          Recommended
        </h2>

        HARDCODED, RECOMMENDED REPORTS GO HERE
      </div>
    </div>
  );
}
