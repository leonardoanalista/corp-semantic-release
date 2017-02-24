'use strict';
const shell = require('shelljs');

module.exports = {

  isFirstRelease(latestTag) {
    return latestTag === 'HEAD';
  },

  terminateProcess(code) {
    if (code !== 0) {
      shell.exit(code);
    }
  },
};
