'use strict';
const shell = require('shelljs');

module.exports = {

  // Unused?
  fromNodeModule(value) {
    return `${__dirname}/node_modules/${value}`;
  },

  isFirstRelease(latestTag) {
    return latestTag === 'HEAD';
  },

  terminateProcess(code) {
    if (code !== 0) {
      shell.exit(code);
    }
  }
};
