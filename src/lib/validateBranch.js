
'use strict';
const log = require('./log');
const shell = require('shelljs');

module.exports = function validateBranch(branch) {
  shell.exec('git branch').output;
  var currentBranch = shell.exec('git rev-parse --abbrev-ref HEAD').output.split('\n')[0];

  if (branch !== currentBranch) {
    log.error('You can not release from branch other than master. Use option --branch to specify branch name.');
    shell.exit(1);
  } else {
    log.info('>>> Your release branch is: ' + branch);
  }
};
