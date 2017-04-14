'use strict';
const log = require('./log');
const shell = require('shelljs');

module.exports = function runPreCommitScript(script, scriptName, version) {
  if (script) {
    log.info(`>>> about to run your ${scriptName} script called "${script}". Command is: npm run ${script}`);
    shell.exec(`npm run ${script} -- ${version}`).stdout;
  }
};
