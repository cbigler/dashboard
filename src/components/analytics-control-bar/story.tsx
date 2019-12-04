/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import { DATE_RANGES } from '../../helpers/space-time-utilities';
import user from './user.json';
import spaces from './spaces.json';
import hierarchy from './hierarchy.json';
import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';
const SPACES = spaces.map(objectSnakeToCamel);
const FORMATTED_HIERARCHY = spaceHierarchyFormatter(hierarchy.map(objectSnakeToCamel));

import AnalyticsControlBar, { AnalyticsControlBarSaveButtonState } from './index';
import { QueryInterval, AnalyticsFocusedMetric } from '../../types/analytics';
import AnalyticsSpaceSelector from '../analytics-control-bar-space-selector';

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
      user: user,
      metric: AnalyticsFocusedMetric.ENTRANCES,
      interval: QueryInterval.ONE_HOUR,
      dateRange: DATE_RANGES.LAST_30_DAYS,
      timeFilter: [],
      selections: [],
    }}>
      {(state, setState) => (
      <AnalyticsControlBar
        userState={{ loading: false, error: null, data: state.user }}
        metric={state.metric}
        onChangeMetric={metric => setState({ ...state, metric })}

        selections={state.selections}
        onChangeSelections={selections => setState({ ...state, selections })}

        interval={state.interval}
        onChangeInterval={interval => setState({ ...state, interval })}

        dateRange={state.dateRange}
        onChangeDateRange={dateRange => setState({ ...state, dateRange })}

        timeFilter={state.timeFilter}
        onChangeTimeFilter={timeFilter => setState({ ...state, timeFilter })}

        spaces={SPACES}
        formattedHierarchy={FORMATTED_HIERARCHY}

        onRequestDataExport={() => {}}

        reportName="" 
        
        saveButtonState={AnalyticsControlBarSaveButtonState.NORMAL}
        onSave={action('Save')}
        refreshEnabled={true}
        onRefresh={action('Refresh')}
        moreMenuVisible={true}
      />
      )}
    </State>
  ))
  .add('With actions', () => (
    <State initialState={{
      metric: AnalyticsFocusedMetric.ENTRANCES,
      selections: [],
      interval: QueryInterval.ONE_HOUR,
      dateRange: DATE_RANGES.LAST_30_DAYS,
      timeFilter: [],
    }}>
      {(state, setState) => (
      <AnalyticsControlBar
        userState={{ loading: false, error: null, data: state.user }}
        metric={state.metric}
        onChangeMetric={metric => setState({ ...state, metric })}

        selections={state.selections}
        onChangeSelections={selections => {
          action('onChangeSelections')(selections)
          setState({ ...state, selections })
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

        timeFilter={state.timeFilter}
        onChangeTimeFilter={timeFilter => setState({ ...state, timeFilter })}

        spaces={SPACES}
        formattedHierarchy={FORMATTED_HIERARCHY}

        onRequestDataExport={() => {}}

        reportName=""

        saveButtonState={AnalyticsControlBarSaveButtonState.NORMAL}
        onSave={action('Save')}
        refreshEnabled={true}
        onRefresh={action('Refresh')}
        moreMenuVisible={true}
      />
      )}
    </State>  
  ))
  .add('With a lot of space filters', () => (
    <State initialState={{
      user: user,
      metric: AnalyticsFocusedMetric.ENTRANCES,
      selections: [
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
      timeFilter: [],
    }}>
      {(state, setState) => (
        <AnalyticsControlBar
          userState={{ loading: false, error: null, data: state.user }}
          metric={state.metric}
          onChangeMetric={metric => setState({ ...state, metric })}

          selections={state.selections}
          onChangeSelections={selections => setState({ ...state, selections })}

          interval={state.interval}
          onChangeInterval={interval => setState({ ...state, interval })}

          dateRange={state.dateRange}
          onChangeDateRange={dateRange => setState({ ...state, dateRange })}

          timeFilter={state.timeFilter}
          onChangeTimeFilter={timeFilter => setState({ ...state, timeFilter })}

          spaces={SPACES}
          formattedHierarchy={FORMATTED_HIERARCHY}

          onRequestDataExport={() => { }}

          reportName=""
          
          saveButtonState={AnalyticsControlBarSaveButtonState.NORMAL}
          onSave={action('Save')}
          refreshEnabled={true}
          onRefresh={action('Refresh')}
          moreMenuVisible={true}
        />
      )}
    </State>
  ))

storiesOf('Analytics Control Bar / Space Selector', module)
  .add('Default', () => (
    <State initialState={{open: false, selection: {field: '', values: []}}}>
      {(state, setState) => (
        <Fragment>
          <p>Note: Try selecting the button below and tabbing to test keyboard interactivity.</p>
          <button>Focusable item before space selector</button>
          <br/>
          <br/>
          <AnalyticsSpaceSelector
            selection={state.selection}

            open={state.open}
            onOpen={() => setState({...state, open: true})}
            onClose={selection => setState({...state, selection, open: false})}

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
    <State initialState={{open: false, selection: {field: 'spaceType', values: ['space']}}}>
      {(state, setState) => (
        <AnalyticsSpaceSelector
          selection={state.selection}

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
    <State initialState={{open: false, selection: {field: 'spaceType', values: ['space']}}}>
      {(state, setState) => (
        <div style={{padding: 20}}>
          <AnalyticsSpaceSelector
            selection={state.selection}

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
