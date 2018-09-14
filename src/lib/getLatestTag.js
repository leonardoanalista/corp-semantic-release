'use strict';
const semverValid = require('semver').valid;
const shell = require('shelljs');
const log = require('./log');

module.exports = function getLatestTag(verbose, prefix) {
  if (verbose === undefined) verbose = false;

  const regex = /tag:\s*(.+?)[,\)]/gi;
  const cmd = 'git log --date-order --tags --simplify-by-decoration --pretty=format:"%d"';
  let data = shell.exec(cmd, {silent: true}).stdout;
  let latestTag = null;

  data.split('\n').some(function(decorations) {
    let match;
    while (match = regex.exec(decorations)) { // eslint-disable-line no-cond-assign
      let tag = match[1];
      if (tag.startsWith(prefix)) {
        const search = tag.replace(prefix, '');
        console.log(search);
        if (semverValid(search)) {
          latestTag = tag;
          return true;
        }
      }
      if (semverValid(tag)) {
        latestTag = tag;
        return true;
      }
    }
  });

  if (latestTag) {
    if (verbose) log.info('>> Your latest semantic tag is: ', latestTag);

    latestTag = `${latestTag}..HEAD`;
  } else {
    log.info('>> No SemVer tag found. It seems like your first release? Initial release will be set to v1.0.0 as per npmjs specification.');
    latestTag = 'HEAD';
  }

  return latestTag;
};
