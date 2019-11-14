/* eslint-disable import/first */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import AnalyticsMetricSelector from './index';
import { AnalyticsFocusedMetric } from '../../types/analytics';
import { withState } from '../../helpers/storybook'


storiesOf('Analytics / Metric Selector', module)
  .add('Default', withState({
    selectedMetric: AnalyticsFocusedMetric.ENTRANCES
  }, (state, setState) => {
    return (
      <AnalyticsMetricSelector
        selectedMetric={state.selectedMetric}
        onChange={value => {
          action('onChange')(value);
          setState({ selectedMetric: value })
        }}
      />
    )
  }))