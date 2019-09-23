/* eslint-disable import/first */
import React from 'react';
import { storiesOf } from '@storybook/react';

import AnalyticsLineChart from './index';
import { AnalyticsDatapoint, AnalyticsFocusedMetric, ResourceStatus, AnalyticsReport, QueryInterval, QuerySelectionType, RESOURCE_LOADING } from '../../types/analytics';
import { SPACES, BATCH_COUNTS } from '../../helpers/storybook/fixtures';
import { createDatapoint } from '../../helpers/analytics-datapoint';
import { RangeType, realizeDateRange } from '../../helpers/space-time-utilities';
import analyticsColorScale from '../../helpers/analytics-color-scale';
import moment from 'moment';


const REPORT: AnalyticsReport = {
  id: '8613a4a0-882c-4b86-a59e-8d4b098c6173',
  name: 'A Test Report',
  type: 'LINE_CHART',
  settings: {},
  query: {
    dateRange: {
      type: RangeType.ABSOLUTE,
      startDate: '2019-08-25',
      endDate: '2019-08-31',
    },
    interval: QueryInterval.ONE_HOUR,
    selections: [{
      type: QuerySelectionType.SPACE,
      field: 'function',
      values: ['cafe'],
    }],
    filters: [],
  },
  queryResult: {
    status: ResourceStatus.COMPLETE,
    data: {
      datapoints: Object.entries(BATCH_COUNTS.results).reduce((output: AnalyticsDatapoint[], entry) => {
        const [spaceId, counts] = entry;
        if (!Array.isArray(SPACES)) return output;
        const space = SPACES.find(s => s.id === spaceId);
        if (!space) return output;
        const newDatapoints = counts.map(c => createDatapoint(c, space))
        return output.concat(newDatapoints)
      }, []),
      metrics: BATCH_COUNTS.metrics,
      selectedSpaceIds: ['spc_627589251168469638', 'spc_631011625750495341', 'spc_631002632810398415', 'spc_627623788988596938', 'spc_631003978976461565']
    }
  },
  selectedMetric: AnalyticsFocusedMetric.ENTRANCES,
  hiddenSpaceIds: [],
  isSaved: false,
  isCurrentlySaving: false,
  isOpen: true,
};


storiesOf('Analytics / Line Chart', module)
  .add('Default', () => {
    analyticsColorScale.reset();
    return (
      <AnalyticsLineChart
        report={REPORT}
        {...realizeDateRange(REPORT.query.dateRange, 'utc')}
      />
    )
  })
  .add('Loading state', () => {
    return (
      <AnalyticsLineChart
        report={{
          ...REPORT,
          queryResult: RESOURCE_LOADING
        }}
        {...realizeDateRange(REPORT.query.dateRange, 'utc')}
      />
    )
  })
