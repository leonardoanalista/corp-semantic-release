'use strict';
const log = require('./log');

module.exports = function isReleaseNecessary(bumpType, latestTag, parsedCommits, verbose) {
  if (verbose === undefined) verbose = false;

  if (!bumpType || bumpType === '') {
    log.success('\n\nRelease is not necessary at this point. Maybe your commits since your last tag only contains "docs", "style", "refactor", "test" and/or "chore"\n');

    log.info('---> YOUR LATEST TAG: ', latestTag);
    if (!verbose) log.info('Run this command again with -v or --verbose to see the commit list from last tag until HEAD.');

    if (verbose) {
      log.info('PARSED COMMIT LIST SINCE YOUR LATEST TAG:\n');

      log.info('>>> parsedCommits: ', parsedCommits);
    }

    return false;
  }

  return true;
};
