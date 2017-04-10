'use strict';
const terminateProcess = require('./helpers').terminateProcess;
const shell = require('shelljs');
const log = require('./log');

module.exports = function addFilesAndCreateTag(newVersion) {
  let code;
  // ###### Add edited files to git #####
  log.info('>>> About to add and commit package.json and CHANGELOG...');
  code = shell.exec('git add package.json CHANGELOG.md').code;
  terminateProcess(code);

  // ###### Commit files #####
  code = shell.exec('git commit -m "chore(release): ' + newVersion + '"').code;
  terminateProcess(code);

  // ###### TAG NEW VERSION #####
  log.info(`>> Time to create the Semantic Tag: ${newVersion}`);
  code = shell.exec('git tag ' + newVersion).code;
  terminateProcess(code);

  // ###### PUSH CHANGES #####
  log.info('>>...and push to remote...');
  return shell.exec('git push && git push --tags').stdout;
};
