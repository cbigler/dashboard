import React, { Fragment } from 'react';
import { storiesOf } from '@storybook/react';
import { v4 as uuidv4 } from 'uuid';

import { COLORS, colorScale } from '.';

const ids = [...Array(10)].map(_ => uuidv4()) as string[];


storiesOf('Analytics Color Scale', module)
  .add('Default', () => {
    const scale = colorScale(Array.from(COLORS));
    return (
      <Fragment>
        <div style={{display: 'flex', flexDirection: 'row'}}>
        {ids.map(i => (
          <div key={i} style={{
            width: 20,
            height: 20,
            margin: 1,
            backgroundColor: scale(i),
          }}></div>
        ))}
        </div>
      </Fragment>
    )
  })