import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import uuid from 'uuid/v4';

import analyticsColorScale from '.';

const ids = [...Array(10)].map(_ => uuid()) as string[];


storiesOf('Analytics Color Scale', module)
  .add('Default', () => {
    analyticsColorScale.reset();
    return (
      <Fragment>
        <div style={{display: 'flex', flexDirection: 'row'}}>
        {ids.map(i => (
          <div key={i} style={{
            width: 20,
            height: 20,
            margin: 1,
            backgroundColor: analyticsColorScale(i),
          }}></div>
        ))}
        </div>
      </Fragment>
    )
  })