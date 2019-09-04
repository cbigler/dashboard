import React, { useState } from 'react';
import styles from './styles.module.scss';

import AnalyticsControlBar from '../analytics-control-bar';
import AnalyticsTabs from '../analytics-tabs';

import { QueryInterval, ResourceStatus, AnalyticsFocusedMetric } from '../../types/analytics';
import { DATE_RANGES } from '../../helpers/space-time-utilities';

import { RxReduxStore } from '../../rx-stores';
// import AnalyticsStore from '../../rx-stores/analytics';
import useRxStore from '../../helpers/use-rx-store';
// import useRxDispatch from '../../helpers/use-rx-dispatch';

import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';

import {
  AppFrame,
  AppPane,
} from '@density/ui';

export default function Analytics() {
  const { spaces, spaceHierarchy } = useRxStore(RxReduxStore);

  // FIXME: uncomment the below once the analytics state is in the store
  // const state = useRxStore(AnalyticsStore);
  // const dispatch = useRxDispatch();

  const formattedHierarchy = spaceHierarchyFormatter(spaceHierarchy.data);


  // FIXME: the below is mostly just throwaway logic, this will eventually go into the analytics
  // store. But I wanted something so that I could try out these components within this component
  // for now!

  const [ activeReportId, setActiveReportId ] = useState<Any<InAHurry>>(null);
  const [ reports, setReports ] = useState<Any<InAHurry>>([]);

  const activeReport = activeReportId ? reports.find(r => r.id === activeReportId) : null;

  function updateReport(id, updateCallback) {
    const reportIndex = reports.findIndex(r => r.id === id);
    if (reportIndex !== -1) {
      const newReports = reports.slice();
      newReports[reportIndex] = updateCallback(reports[reportIndex]);
      setReports(newReports);
    }
  }

  // FIXME: END THROWAWAY LOGIC

  return (
    <AppFrame>
      <AppPane>
        <div className={styles.analytics}>
          <AnalyticsTabs
            reports={reports}
            activeReportId={activeReportId}
            onChangeActiveReport={setActiveReportId}
            onCloseReport={reportId => {
              setReports(reports.filter(r => r.id !== reportId));
              setActiveReportId(null);
            }}
            onAddNewReport={() => {
              const id = Math.random().toString();
              setReports([...reports, {
                id,
                name: 'Untitled Report',
                query: {
                  dateRange: DATE_RANGES.LAST_WEEK,
                  interval: QueryInterval.ONE_HOUR,
                  selections: [],
                  filters: [],
                },
                queryResult: { status: ResourceStatus.IDLE },
                hiddenSpaceIds: [],
                selectedMetric: AnalyticsFocusedMetric.MAX,
                lastRunTimestamp: undefined,
                isSaved: false,
              }]);
              setActiveReportId(id);
            }}
          />
          {activeReport ? (
            <AnalyticsControlBar
              filters={activeReport.query.filters}
              onChangeFilters={filters => updateReport(activeReport.id, report => ({ ...report, query: { ...report.query, filters } }))}

              interval={activeReport.query.interval}
              onChangeInterval={interval => updateReport(activeReport.id, report => ({ ...report, query: { ...report.query, interval } }))}

              dateRange={activeReport.query.dateRange}
              onChangeDateRange={dateRange => updateReport(activeReport.id, report => ({ ...report, query: { ...report.query, dateRange } }))}

              spaces={spaces.data}
              formattedHierarchy={formattedHierarchy}
            />
          ) : null}
        </div>
      </AppPane>
    </AppFrame>
  );
}
