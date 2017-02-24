'use strict';
const helpers = require('./helpers');
const shell = require('shelljs');
const log = require('./log');

module.exports = function bumpUpVersion(bumpType, latestTag) {
  log.info('>>> update version on package.json...');
  try {
    let version = 'v1.0.0'; // First Release

    if (helpers.isFirstRelease(latestTag)) {
      shell.exec('npm version --no-git-tag-version ' + version).output.split('\n')[0];
    } else {
      version = shell.exec('npm version --no-git-tag-version ' + bumpType).output.split('\n')[0];
    }
  } catch (error) {
    log.error(error);
    helpers.terminateProcess(1);
  }

  return version;
};
