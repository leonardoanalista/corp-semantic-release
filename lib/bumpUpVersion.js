'use strict';
const helpers = require('./helpers');
const shell = require('shelljs');
const log = require('./log');

module.exports = function bumpUpVersion(bumpType, latestTag) {

  log.info('>>> update version on package.json...');
  try {
    var newVersion;
    if (helpers.isFirstRelease(latestTag)) {
      newVersion = 'v1.0.0';
      shell.exec('npm version --no-git-tag-version ' + newVersion).output.split('\n')[0];
    } else {
      newVersion = shell.exec('npm version --no-git-tag-version ' + bumpType).output.split('\n')[0];
    }

    return newVersion;
  } catch (error) {
    helpers.terminateProcess(1);
  }
};
