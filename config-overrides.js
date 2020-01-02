const addPaths = require('./config-add-paths');

// Override create-react-app webpack config to add extra included paths
// See ./config-add-paths.js for details
module.exports = function override(config, env) {
  config.module.rules.forEach(rule => !!rule.oneOf && rule.oneOf.forEach(addPaths));
  return config;
}
