const fs = require('fs');
const addPaths = require('../config-add-paths');

module.exports = ({ config, mode }) => {

  // See ../config-add-paths.js for details
  config.module.rules.forEach(addPaths);
  
  // Add rules to process TypeScript storybook stories
  config.module.rules.push({
    test: /story\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [['react-app', { flow: false, typescript: true }]],
    },
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
