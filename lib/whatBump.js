'use strict';
const log = require('./log');

module.exports = function whatBumpFn(parsedCommits) {
  var type;

  parsedCommits.every(function (commit) {
    if (commit.breaks.length) {
      type = 'major';
      return false;
    }

    if (commit.type === 'feat') type = 'minor';

    if (!type && commit.type === 'fix') type = 'patch';

    return true;
  });

  log.info('>>> Bump type is', type);
  return type;
};
