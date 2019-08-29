/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import AnalyticsTable, { AnalyticsFocusedMetric, ResourceStatus } from './index';
import { RangeType } from '../../helpers/space-time-utilities';

import spaces from './spaces.json';
const SPACES = spaces.map(objectSnakeToCamel);

function State({ initialState, children }) {
  const [state, setState] = useState(initialState);
  return (
    <Fragment>
      {children(state, setState)}
      <br />
      <br />
      <strong>State:</strong>
      <br />
      <pre style={{height: 100, overflow: 'auto', padding: 8, background: '#eee'}}>
        {JSON.stringify(state, null, 2)}
      </pre>
    </Fragment>
  )
}

const QUERY = {
  timeframe: {
    type: RangeType.ABSOLUTE,
    startDate: '2019-01-01',
    endDate: '2019-02-01',
  },
  granularity: '5m',
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
        average: 10,
        max: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
      entrances: {
        average: 10,
        peak: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: 100,
      },
      exits: {
        average: 10,
        peak: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: 100,
      },
      targetUtilization: {
        average: 10,
        durations: {
          0: 'not sure what this is',
          40: 'not sure what this is',
          80: 'not sure what this is',
          100: 'not sure what this is',
        },
        max: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
    },
    'spc_631245341374546129': {
      count: {
        average: 10,
        max: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
      entrances: {
        average: 10,
        peak: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: 100,
      },
      exits: {
        average: 10,
        peak: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: 100,
      },
      targetUtilization: {
        average: 10,
        durations: {
          0: 'not sure what this is',
          40: 'not sure what this is',
          80: 'not sure what this is',
          100: 'not sure what this is',
        },
        max: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
    },
    'spc_631011907855188085': {
      count: {
        average: 10,
        max: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
      },
      entrances: {
        average: 10,
        peak: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: 100,
      },
      exits: {
        average: 10,
        peak: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        total: 100,
      },
      targetUtilization: {
        average: 10,
        durations: {
          0: 'not sure what this is',
          40: 'not sure what this is',
          80: 'not sure what this is',
          100: 'not sure what this is',
        },
        max: {
          value: 10,
          timestamp: '2019-01-01T00:00:00Z',
        },
        min: {
          value: 10,
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
  selectedMetric: AnalyticsFocusedMetric.ENTRANCES,
  lastRunTimestamp: '2019-01-01T00:00:00Z',
};

storiesOf('Analytics Table', module)
  .add('Default', () => (
    <State initialState={ANALYTICS_REPORT}>
      {(state, setState) => (
        <AnalyticsTable
          spaces={SPACES}
          analyticsReport={state}

          onChangeHiddenSpaceIds={hiddenSpaceIds => setState({...state, hiddenSpaceIds})}
        />
    )}
    </State>
  ))
