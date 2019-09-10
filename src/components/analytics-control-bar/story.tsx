/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DATE_RANGES } from '../../helpers/space-time-utilities';
import spaces from './spaces.json';
import hierarchy from './hierarchy.json';
import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';
const SPACES = spaces.map(objectSnakeToCamel);
const FORMATTED_HIERARCHY = spaceHierarchyFormatter(hierarchy.map(objectSnakeToCamel));

import AnalyticsControlBar from './index';
import { QueryInterval, AnalyticsFocusedMetric } from '../../types/analytics';
import AnalyticsSpaceSelector from '../analytics-control-bar-space-filter';

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

storiesOf('Analytics Control Bar', module)
  .add('Default', () => (
    <State initialState={{
      metric: AnalyticsFocusedMetric.ENTRANCES,
      interval: QueryInterval.ONE_HOUR,
      dateRange: DATE_RANGES.LAST_30_DAYS,
      filters: [],
    }}>
      {(state, setState) => (
      <AnalyticsControlBar
        metric={state.metric}
        onChangeMetric={metric => setState({ ...state, metric })}

        filters={state.filters}
        onChangeFilters={filters => setState({ ...state, filters })}

        interval={state.interval}
        onChangeInterval={interval => setState({ ...state, interval })}

        dateRange={state.dateRange}
        onChangeDateRange={dateRange => setState({ ...state, dateRange })}

        spaces={SPACES}
        formattedHierarchy={FORMATTED_HIERARCHY}
      />
      )}
    </State>
  ))
  .add('With actions', () => (
    <State initialState={{
      metric: AnalyticsFocusedMetric.ENTRANCES,
      filters: [],
      interval: QueryInterval.ONE_HOUR,
      dateRange: DATE_RANGES.LAST_30_DAYS,
    }}>
      {(state, setState) => (
      <AnalyticsControlBar
        metric={state.metric}
        onChangeMetric={metric => setState({ ...state, metric })}

        filters={state.filters}
        onChangeFilters={filters => {
          action('onChangeFilters')(filters)
          setState({ ...state, filters })
        }}

        interval={state.interval}
        onChangeInterval={interval => {
          action('onChangeInterval')(interval)
          setState({ ...state, interval })
        }}

        dateRange={state.dateRange}
        onChangeDateRange={dateRange => {
          action('onChangeDateRange')(dateRange)
          setState({ ...state, dateRange })
        }}

        spaces={SPACES}
        formattedHierarchy={FORMATTED_HIERARCHY}
      />
      )}
    </State>  
  ))
  .add('With a lot of space filters', () => (
    <State initialState={{
      metric: AnalyticsFocusedMetric.ENTRANCES,
      filters: [
        {field: 'spaceType', values: ['space']},
        {field: 'spaceType', values: ['space']},
        {field: 'spaceType', values: ['space']},
        {field: 'spaceType', values: ['space']},
        {field: 'spaceType', values: ['space']},
        {field: 'spaceType', values: ['space']},
        {field: 'spaceType', values: ['space']},
        {field: 'spaceType', values: ['space']},
        {field: 'spaceType', values: ['space']},
        {field: 'spaceType', values: ['space']},
        {field: 'spaceType', values: ['space']},
      ],
      interval: QueryInterval.ONE_HOUR,
      dateRange: DATE_RANGES.LAST_30_DAYS,
    }}>
      {(state, setState) => (
        <AnalyticsControlBar
          metric={state.metric}
          onChangeMetric={metric => setState({ ...state, metric })}

          filters={state.filters}
          onChangeFilters={filters => setState({ ...state, filters })}

          interval={state.interval}
          onChangeInterval={interval => setState({ ...state, interval })}

          dateRange={state.dateRange}
          onChangeDateRange={dateRange => setState({ ...state, dateRange })}

          spaces={SPACES}
          formattedHierarchy={FORMATTED_HIERARCHY}
        />
      )}
    </State>
  ))

storiesOf('Analytics Control Bar / Space Selector', module)
  .add('Default', () => (
    <State initialState={{open: false, filter: {field: '', values: []}}}>
      {(state, setState) => (
        <Fragment>
          <p>Note: Try selecting the button below and tabbing to test keyboard interactivity.</p>
          <button>Focusable item before space selector</button>
          <br/>
          <br/>
          <AnalyticsSpaceSelector
            filter={state.filter}

            open={state.open}
            onOpen={() => setState({...state, open: true})}
            onClose={filter => setState({...state, filter, open: false})}

            spaces={SPACES}
            formattedHierarchy={FORMATTED_HIERARCHY}
          />
          <br/>
          <br/>
          <button>Focusable item after space selector</button>
        </Fragment>
      )}
    </State>
  ))
  .add('Starting with spaceType=space selected', () => (
    <State initialState={{open: false, filter: {field: 'spaceType', values: ['space']}}}>
      {(state, setState) => (
        <AnalyticsSpaceSelector
          filter={state.filter}

          open={state.open}
          onOpen={() => setState({...state, open: true})}
          onClose={() => setState({...state, open: false})}

          spaces={SPACES}
          formattedHierarchy={FORMATTED_HIERARCHY}
        />
      )}
    </State>
  ))
  .add('With delete button shown and onDelete callback attached', () => (
    <State initialState={{open: false, filter: {field: 'spaceType', values: ['space']}}}>
      {(state, setState) => (
        <div style={{padding: 20}}>
          <AnalyticsSpaceSelector
            filter={state.filter}

            open={state.open}
            onOpen={() => setState({...state, open: true})}
            onClose={() => setState({...state, open: false})}

            deletable
            onDelete={action('onDelete')}

            spaces={SPACES}
            formattedHierarchy={FORMATTED_HIERARCHY}
          />
        </div>
      )}
    </State>
  ))

// storiesOf('Analytics Control Bar / Date Selector', module)
//   .add('Default', () => (
//     <State initialState={null}>
//       {(state, setState) => (
//         <AnalyticsDateSelector
//           value={state}
//           onChange={setState}
//         />
//       )}
//     </State>
//   ))
