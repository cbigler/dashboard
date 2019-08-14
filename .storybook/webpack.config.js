const fs = require('fs');
const path = require('path');

module.exports = ({config, mode}) => {

  config.module.rules.push({
    test: /story\.(js|ts)x?$/,
    loaders: [
      {
        loader: require.resolve('@storybook/addon-storysource/loader'),
        options: { parser: 'javascript' },
      },
    ],
    enforce: 'pre',
  });

  return config;
};
