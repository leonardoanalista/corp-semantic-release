'use strict';
const helpers = require('./helpers');
const shell = require('shelljs');
const log = require('./log');

module.exports = function bumpUpVersion(bumpType, latestTag, tagPrefix) {
  log.info('>>> update version on package.json...');
  let version = 'v1.0.0'; // First Release

  try {
    if (helpers.isFirstRelease(latestTag)) {
      shell.exec('npm version --no-git-tag-version ' + version).stdout.split('\n')[0];
    } else {
      version = shell.exec('npm version --no-git-tag-version ' + bumpType).stdout.split('\n')[0];
    }
  } catch (error) {
    log.error(error);
    helpers.terminateProcess(1);
  }
  if (tagPrefix !== '') {
    version = `${tagPrefix}${version}`;
    console.log(version);
  }
  return version;
};
