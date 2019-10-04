module.exports = {
  'extends': [
    'react-app',
    'plugin:compat/recommended'
  ],
  'env': {
    'browser': true,
  },
  'rules': {
    'semi': 1,
    'camelcase': 1,
    'arrow-spacing': [1, { before: true, after: true }],
    'prefer-arrow-callback': 1,
    'prefer-template': 1,
    'quotes': [1, 'single', { allowTemplateLiterals: true }],
    'jsx-quotes': [1, 'prefer-double'],
  },
  'settings': {
    'polyfills': [
      'Promise',
      'Object.assign',
      'Object.entries',
      'Object.is',
      'URL.createObjectURL',
    ]
  },
  // Overrides for Test files
  'overrides': [{
    'files': ['*.test.js', '*.test.ts'],
    'env': {
      'node': true,
      'jest': true
    },
    'rules': {
      'prefer-arrow-callback': 0
    }
  }]
}
