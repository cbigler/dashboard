/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import objectSnakeToCamel from '../../helpers/object-snake-to-camel';
import spaces from './spaces.json';
import hierarchy from './hierarchy.json';
import spaceHierarchyFormatter from '../../helpers/space-hierarchy-formatter';
const SPACES = spaces.map(objectSnakeToCamel);
const FORMATTED_HIERARCHY = spaceHierarchyFormatter(hierarchy.map(objectSnakeToCamel));

import AnalyticsControlBar, { AnalyticsSpaceSelector, AnalyticsDateSelector } from './index';

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
    <State initialState={[{field: '', values: []}]}>
      {(state, setState) => (
        <AnalyticsControlBar
          filters={state}
          onChangeFilters={setState}

          spaces={SPACES}
          formattedHierarchy={FORMATTED_HIERARCHY}
        />
      )}
    </State>
  ))

storiesOf('Analytics Control Bar / Space Selector', module)
  .add('Default', () => (
    <State initialState={{field: '', values: []}}>
      {(state, setState) => (
        <Fragment>
          <p>Note: Try selecting the button below and tabbing to test keyboard interactivity.</p>
          <button>Focusable item before space selector</button>
          <br/>
          <br/>
          <AnalyticsSpaceSelector
            filter={state}
            onChange={setState}
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
    <State initialState={{field: 'spaceType', values: ['space']}}>
      {(state, setState) => (
        <AnalyticsSpaceSelector
          filter={state}
          onChange={setState}
          spaces={SPACES}
          formattedHierarchy={FORMATTED_HIERARCHY}
        />
      )}
    </State>
  ))
  .add('With delete button shown and onDelete callback attached', () => (
    <State initialState={{field: '', values: []}}>
      {(state, setState) => (
        <div style={{padding: 48}}>
          <AnalyticsSpaceSelector
            filter={state}
            onChange={setState}
            deletable
            onDelete={action('onDelete')}
            spaces={SPACES}
            formattedHierarchy={FORMATTED_HIERARCHY}
          />
        </div>
      )}
    </State>
  ))

storiesOf('Analytics Control Bar / Date Selector', module)
  .add('Default', () => (
    <State initialState={null}>
      {(state, setState) => (
        <AnalyticsDateSelector
          value={state}
          onChange={setState}
        />
      )}
    </State>
  ))
