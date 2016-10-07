'use strict';
const parseRawCommit = require('./parseRawCommit');
const shell = require('shelljs');

module.exports = function getJsonCommits(latestTag) {
  var rawCommits = shell.exec(`git log -E --format=%H==SPLIT==%B==END== ${latestTag}`, {silent: true}).output;

  var commits = rawCommits.split('==END==\n')
    .filter(function (raw) {
      return !!raw.trim();
    }).map(function (raw) {
      var data = raw.split('==SPLIT==');
      return {
        hash: data[0],
        message: data[1]
      };
    });

  var parsedCommits = commits.map(function (commit) {
    return parseRawCommit(commit.hash + '\n' + commit.message);
  }).filter(function (commit) {
    return !!commit;
  });

  return parsedCommits;
};
