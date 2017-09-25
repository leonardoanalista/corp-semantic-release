'use strict';

// START_CONFIT_GENERATED_CONTENT
let config = {
  extends: ['google', 'plugin:node/recommended'],
  plugins: ['node'],
  env: {
    commonjs: true,    // For Webpack, CommonJS
    'node': true,
    'mocha': true,
    'es6': true
  },
  globals: {

  },
  parser: 'espree',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: true,
      jsx: false,
    }
  },
  rules: {
    'max-len': ['warn', 200],  // Line length
    'require-jsdoc': ['off']
  }
};
// END_CONFIT_GENERATED_CONTENT
// Customise 'config' further in this section to meet your needs...



// START_CONFIT_GENERATED_CONTENT
module.exports = config;
// END_CONFIT_GENERATED_CONTENT
