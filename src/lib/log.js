'use strict';
const chalk = require('chalk');

/* eslint no-console: 0 */
const log = console.log;
const info = console.info;

const _error = chalk.bold.red;
const _success = chalk.bold.green;
const _announce = chalk.bold.bgGreen.white;
const _info = chalk.bold.cyan;

// TODO: change to spread operator
module.exports = {
  info: (msg, obj) => log(_info(msg), obj || ''),
  success: (msg, obj) => log(_success(msg), obj || ''),
  announce: (msg, obj) => info(_announce(msg), obj || ''),
  error: (msg, obj) => log(_error(msg), obj || ''),
};
