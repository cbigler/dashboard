/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { CoreSpace } from '@density/lib-api-types/core-v2/spaces';

import AnalyticsTable from './index';
import { DateRangeType } from '@density/lib-time-helpers/date-range';
import { ResourceStatus } from '../../types/resource';
import { AnalyticsFocusedMetric } from '../../types/analytics';

import spaces from './spaces.json';
const SPACES = spaces as Array<CoreSpace>;

function State({ initialState, children }) {
  const [state, setState] = useState(initialState);
  return (
    <Fragment>
      {children(state, setState)}
      <br />
      <br />
      <strong>State:</strong>
      <br />
      <pre style={{height: 300, overflow: 'auto', padding: 8, background: '#eee'}}>
        {JSON.stringify(state, null, 2)}
      </pre>
    </Fragment>
  )
}

function random() {
  return Math.floor(Math.random() * 100);
}

const QUERY = {
  dateRange: {
    type: DateRangeType.ABSOLUTE,
    startDate: '2019-01-01',
    endDate: '2019-02-01',
  },
  interval: '5m',
  filters: [
    {
      field: 'id',
      values: ['spc_631284005076992363'],
    },
  ],
};

const QUERY_RESULT = {
  datapoints: [],
  selectedSpaceIds: ['spc_631284005076992363', 'spc_631245341374546129', 'spc_631011907855188085'],
  metrics: {
    'spc_631284005076992363': {
      count: {
        average: random(),
        max: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
      entrances: {
        average: random(),
        peak: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: random(),
      },
      exits: {
        average: random(),
        peak: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: random(),
      },
      target_utilization: {
        average: random(),
        durations: {
          0: 'not sure what this is',
          40: 'not sure what this is',
          80: 'not sure what this is',
          100: 'not sure what this is',
        },
        max: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
    },
    'spc_631245341374546129': {
      count: {
        average: random(),
        max: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
      entrances: {
        average: random(),
        peak: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: random(),
      },
      exits: {
        average: random(),
        peak: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: random(),
      },
      target_utilization: {
        average: random(),
        durations: {
          0: 'not sure what this is',
          40: 'not sure what this is',
          80: 'not sure what this is',
          100: 'not sure what this is',
        },
        max: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
    },
    'spc_631011907855188085': {
      count: {
        average: random(),
        max: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
      entrances: {
        average: random(),
        peak: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: random(),
      },
      exits: {
        average: random(),
        peak: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: random(),
      },
      target_utilization: {
        average: random(),
        durations: {
          0: 'not sure what this is',
          40: 'not sure what this is',
          80: 'not sure what this is',
          100: 'not sure what this is',
        },
        max: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: random(),
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
    },
  },
};

const ANALYTICS_REPORT = {
  id: 'rpt_xxx',
  name: 'My cool report',
  query: QUERY,
  queryResult: {status: ResourceStatus.COMPLETE, data: QUERY_RESULT},
  hiddenSpaceIds: [],
  /* selectedMetric */
  lastRunTimestamp: '2019-01-01T00:00:00Z',
};

const ANALYTICS_REPORT_ENTRANCES = { ...ANALYTICS_REPORT, selectedMetric: AnalyticsFocusedMetric.ENTRANCES },
      ANALYTICS_REPORT_MAX = { ...ANALYTICS_REPORT, selectedMetric: AnalyticsFocusedMetric.MAX },
      ANALYTICS_REPORT_UTILIZATION = { ...ANALYTICS_REPORT, selectedMetric: AnalyticsFocusedMetric.UTILIZATION };

storiesOf('Analytics Table', module)
  .add('With visits data', () => (
    <State initialState={ANALYTICS_REPORT_ENTRANCES}>
      {(state, setState) => (
        <AnalyticsTable
          spaces={SPACES}
          analyticsReport={state}
          onClickColumnHeader={() => {}}
          onChangeHiddenSpaceIds={hiddenSpaceIds => setState({...state, hiddenSpaceIds})}
          onChangeHighlightedSpaceId={highlightedSpaceId => setState({...state, highlightedSpaceId})}
        />
    )}
    </State>
  ))
  .add('With max count data', () => (
    <State initialState={ANALYTICS_REPORT_MAX}>
      {(state, setState) => (
        <AnalyticsTable
          spaces={SPACES}
          analyticsReport={state}
          onClickColumnHeader={() => {}}
          onChangeHiddenSpaceIds={hiddenSpaceIds => setState({...state, hiddenSpaceIds})}
          onChangeHighlightedSpaceId={highlightedSpaceId => setState({...state, highlightedSpaceId})}
        />
    )}
    </State>
  ))
  .add('With utiization data', () => (
    <State initialState={ANALYTICS_REPORT_UTILIZATION}>
      {(state, setState) => (
        <AnalyticsTable
          spaces={SPACES}
          analyticsReport={state}
          onClickColumnHeader={() => {}}
          onChangeHiddenSpaceIds={hiddenSpaceIds => setState({...state, hiddenSpaceIds})}
          onChangeHighlightedSpaceId={highlightedSpaceId => setState({...state, highlightedSpaceId})}
        />
    )}
    </State>
  ))
