'use strict';
const chalk = require('chalk');

/* eslint no-console: 0 */
const LOG = console.log;
const INFO = console.info;

const _error = chalk.bold.red;
const _success = chalk.bold.green;
const _announce = chalk.bold.bgGreen.white;
const _info = chalk.bold.cyan;

// TODO: change to spread operator
module.exports = {
  info: (msg, obj) => LOG(_info(msg), obj),
  success: (msg, obj) => LOG(_success(msg), obj),
  announce: (msg, obj) => INFO(_announce(msg), obj),
  error: (msg, obj) => LOG(_error(msg), obj)
};
