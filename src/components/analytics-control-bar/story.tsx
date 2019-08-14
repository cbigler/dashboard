/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';

import { AnalyticsSpaceSelector } from './index';

function State({ initialState, children }) {
  const [state, setState] = useState(initialState);
  return (
    <Fragment>
      {children(state, setState)}
      <br />
      <pre>
        {JSON.stringify(state, null, 2)}
      </pre>
    </Fragment>
  )
}

storiesOf('Analytics Control Bar / Space Selector', module)
  .add('Default', () => (
    <State initialState={null}>
      {(state, setState) => (
        <Fragment>
          <button>Focusable Item</button>
          <br/>
          <br/>
          <AnalyticsSpaceSelector />
          <br/>
          <br/>
          <button>Focusable Item</button>
        </Fragment>
      )}
    </State>
  ))
