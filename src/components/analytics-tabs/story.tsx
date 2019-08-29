/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import uuid from 'uuid';

import AnalyticsTabs from './index';

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

storiesOf('Analytics Tabs', module)
  .add('Default', () => (
    <State initialState={{activeId: 'rpt_xxx', reports: [{ id: 'rpt_xxx', name: 'Foo', isSaved: false }]}}>
      {(state, setState) => (
      <AnalyticsTabs
        reports={state.reports}
        activeReportId={state.activeId}
        onChangeActiveReport={activeId => setState({...state, activeId})}
        onCloseReport={id => setState({...state, reports: state.reports.filter(r => r.id !== id)})}
        onAddNewReport={() => setState({...state, reports: [...state.reports, {id: uuid.v4(), name: 'Untitled Report', isSaved: false}]})}
      />
      )}
    </State>
  ))
  // empty state
