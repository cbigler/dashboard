const path = require('path');

// Add paths with un-transpiled/un-bundled code to babel-loader's "include" list
module.exports = function addPaths(rule) {
  if (!!rule.test && rule.test.toString() === '/\\.(js|mjs|jsx|ts|tsx)$/') {
    rule.include = typeof rule.include === 'string' ? [rule.include] : rule.include;
    rule.include = rule.include.concat([

      // Add any npm packages that aren't transpiled/bundled to this list
      // Publishing these packages without bundling is not "correct" for NPM
      // But I'd rather punt on the associated problems and break the rules
      // Also, we get much better source maps to these dependencies this way
      path.resolve('./node_modules/@density/lib-helpers'),
      path.resolve('./node_modules/@density/lib-space-helpers'),
      path.resolve('./node_modules/@density/lib-time-helpers'),
      path.resolve('./node_modules/@density/ui/src'),

    ]);
  }
};
