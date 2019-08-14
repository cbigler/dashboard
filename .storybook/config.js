import '!css-loader!normalize.css';
import 'moment-timezone';
import './styles.scss';

import { configure, addParameters } from '@storybook/react';
addParameters({
  options: {
    panelPosition: 'bottom',
  },
});

function loadStories() {
  // This is some stupid webpack magic. Basically, require in all files in '../src/reports.'
  // http://stackoverflow.com/questions/29891458/webpack-require-every-file-in-directory
  let contextualRequire = require.context('../src', true, /story.(js|ts)x?$/);
  contextualRequire.keys().forEach(storybook => contextualRequire(storybook));
}

configure(loadStories, module);
