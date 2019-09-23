/* eslint-disable import/first */
import React, { Fragment, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import AnalyticsLoadingBar from './index';

storiesOf('Analytics / Loading Bar', module)
  .add('Default', () => (
    <AnalyticsLoadingBar />
  ))
