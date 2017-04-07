'use strict';
const log = require('./log');
const fs = require('fs');
const prependFile = require('prepend-file');
const path = require('path');

module.exports = function writeChangelog(data, replaceContents, verbose) {
  if (verbose === undefined) verbose = false;

  let fileName = path.join(process.cwd(), 'CHANGELOG.md');
  if (verbose) log.info('>>> About to write/append contents to CHANGELOG.md... ');

  if (replaceContents) {
    fs.writeFileSync(fileName, data);
  } else {
    prependFile.sync(fileName, data);
  }
};
