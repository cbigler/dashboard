import React from 'react'
import { storiesOf } from '@storybook/react';

import { withState } from '../../helpers/storybook';
import AnalyticsControlBarTimeFilter from '.';
import { TimeFilter } from '../../types/datetime';
import { DAYS_OF_WEEK } from '@density/lib-time-helpers/date-range';


storiesOf('Analytics Control Bar / Time Filter', module)
  .add('default', withState<{
    timeFilter: TimeFilter,
  }>({
    timeFilter: [{
      start: { hour: 0, minute: 0, second: 0, millisecond: 0 },
      end: { hour: 24, minute: 0, second: 0, millisecond: 0 },
      days: DAYS_OF_WEEK,
    }]
  }, (state, setState) => {
    return (
      <AnalyticsControlBarTimeFilter
        timeFilter={state.timeFilter}
        onApply={(timeFilter) => {
          setState({
            timeFilter,
          })
        }}
      />
    );
  }));
