'use strict';
const log = require('./log');
const prependFile = require('prepend-file');
const path = require('path');

module.exports = function writeChangelog(data, verbose) {
  if (verbose === undefined) verbose = false;

  // var writeFileSync = fs.writeFileSync;
  let fileName = path.join(process.cwd(), 'CHANGELOG.md');
  if (verbose) log.info('>>> About to write/append contents to CHANGELOG.md... ');
  prependFile.sync(fileName, data);
};
