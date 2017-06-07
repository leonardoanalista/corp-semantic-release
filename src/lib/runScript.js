'use strict';
const terminateProcess = require('./helpers').terminateProcess;
const log = require('./log');
const shell = require('shelljs');

module.exports = function runScript(script, scriptType) {
  log.info(`>>> about to run your ${scriptType} script. Command is: ${script}`);
  const code = shell.exec(script).code;
  terminateProcess(code);
};
