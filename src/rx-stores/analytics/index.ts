import { take, switchMap } from 'rxjs/operators';

import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';
import createRxStore, { rxDispatch, actions } from '..';

import { ResourceStatus } from '../../types/resource';
import {
  AnalyticsState,
  AnalyticsFocusedMetric,
} from '../../types/analytics';

import { computeTableData } from '../../helpers/analytics-table';
import { computeChartData } from '../../helpers/analytics-chart';
import { ColorManager, COLORS } from '../../helpers/analytics-color-scale';
import { runQuery } from '../../helpers/analytics-report';

import UserStore from '../user';
import SpacesLegacyStore from '../spaces-legacy';
import SpaceHierarchyStore from '../space-hierarchy';
import analyticsReducer, { initialState } from './reducer';
import { registerSideEffects } from './effects';


// ANALYTICS STORE
const AnalyticsStore = createRxStore<AnalyticsState>('AnalyticsStore', initialState, analyticsReducer);
export default AnalyticsStore;

registerSideEffects(actions, AnalyticsStore, UserStore, SpacesLegacyStore, SpaceHierarchyStore, rxDispatch, runQuery);


export const activeReportDataStream = AnalyticsStore.pipe(
  switchMap(
    () => SpacesLegacyStore.pipe(take(1)),
    (analyticsState, spacesState) => {
      if (analyticsState.status !== ResourceStatus.COMPLETE) {
        return null;
      }
      const activeReportId = analyticsState.data.activeReportId;
      if (!activeReportId) {
        return null;
      }
      const report = analyticsState.data.reports.find(r => r.id === activeReportId);
      if (!report) {
        return null;
      }
      if (report.queryResult.status !== ResourceStatus.COMPLETE) return null;

      // make a space lookup map
      const spaceLookup = new Map<string, CoreSpace>();
      spacesState.data.forEach(space => {
        spaceLookup.set(space.id, space);
      })
      
      const selectedSpaces = report.queryResult.data.selectedSpaceIds
        .map(space_id =>  spaceLookup.get(space_id))
        .filter<CoreSpace>((space): space is CoreSpace => space != null);

      const spacesMissingTargetCapacity = selectedSpaces.filter(space => space.target_capacity == null);

      let validDatapoints = report.queryResult.data.datapoints;

      if (report.selectedMetric === AnalyticsFocusedMetric.UTILIZATION || report.selectedMetric === AnalyticsFocusedMetric.OPPORTUNITY) {
        const invalidSpaceIds = spacesMissingTargetCapacity.map(s => s.id)
        validDatapoints = validDatapoints.filter(datapoint => !invalidSpaceIds.includes(datapoint.space_id));
      }
      
      const tableData = computeTableData(
        report.queryResult.data.metrics,
        selectedSpaces,
        report.selectedMetric,
        report.hiddenSpaceIds,
        report.columnSort,
        report.opportunityCostPerPerson,
      );
      const chartData = computeChartData(
        validDatapoints,
        report.query.interval,
        report.selectedMetric,
        report.hiddenSpaceIds,
      );

      
      const spaceOrder = tableData.rows.map(row => row.space_id);
      
      const colorManager = new ColorManager(Array.from(COLORS))
      const colorMap = new Map<string, string>();
      spaceOrder.forEach(space_id => {
        colorMap.set(space_id, colorManager.next())
      })

      return {
        report,
        tableData,
        chartData,
        spaceOrder,
        colorMap,
      };
    }
  ) 
)
