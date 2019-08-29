const fs = require('fs');
const path = require('path');

module.exports = ({config, mode}) => {
  const typescriptRules = config.module.rules.slice().reverse().find(i => i.test.toString().indexOf('tsx') > 0);
  config.module.rules.push({
    test: /story\.(js|ts)x?$/,
    loaders: [
      {
        loader: typescriptRules.loader,
        options: typescriptRules.options,
      },
      {
        loader: require.resolve('@storybook/addon-storysource/loader'),
        options: { parser: 'javascript' },
      },
    ],
    enforce: 'pre',
  });

  return config;
};
