'use strict';
const parseRawCommit = require('./parseRawCommit');
const shell = require('shelljs');

module.exports = function getJsonCommits(latestTag) {
  const rawCommits = shell.exec(`git log -E --format=%H==SPLIT==%B==END== ${latestTag}`, {silent: true}).stdout;

  const commits = rawCommits.split('==END==\n')
      .filter(function(raw) {
        return !!raw.trim();
      }).map(function(raw) {
        const data = raw.split('==SPLIT==');
        return {
          hash: data[0],
          message: data[1],
        };
      });

  const parsedCommits = commits.map(function(commit) {
    return parseRawCommit(commit.hash + '\n' + commit.message);
  }).filter(function(commit) {
    return !!commit;
  });

  return parsedCommits;
};
