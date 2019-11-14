const fs = require('fs');
const path = require('path');

module.exports = ({ config, mode }) => {
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
