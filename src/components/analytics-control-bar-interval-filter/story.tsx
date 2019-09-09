/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import AnalyticsIntervalFilter from './index';
import { QueryInterval } from '../../types/analytics';

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

storiesOf('Analytics Control Bar / Interval Filter', module)
  .add('Default', () => (
    <State initialState={QueryInterval.ONE_DAY}>
      {(state, setState) => (
        <AnalyticsIntervalFilter
          value={state}
          onChange={setState}
        />
      )}
    </State>
  ))
