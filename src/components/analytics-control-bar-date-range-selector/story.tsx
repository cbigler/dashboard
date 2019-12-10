/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { DATE_RANGES } from '../../helpers/space-time-utilities';
import DateRangeFilter from './index';

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

storiesOf('Analytics Control Bar / Date Selector', module)
  .add('Default', () => (
    <State initialState={DATE_RANGES.LAST_30_DAYS}>
      {(state, setState) => (
        <DateRangeFilter
          value={state}
          onChange={setState}
        />
      )}
    </State>
  ))
