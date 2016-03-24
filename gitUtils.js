'use strict';

var COMMIT_PATTERN = /^(\w*)(\(([\w\$\.\-\* ]*)\))?\: (.*)$/;
var MAX_SUBJECT_LENGTH = 80;

/**
 This file has been literally copied from semantic-release and all other functions have been removed.

*/
function parseRawCommit(raw) {
  if (!raw) {
    return null;
  }

  var lines = raw.split('\n');
  var msg = {};
  var match;

  msg.hash = lines.shift();
  msg.subject = lines.shift();
  msg.closes = [];
  msg.breaks = [];

  msg.subject = msg.subject.replace(/\s*(?:Closes|Fixes|Resolves)\s#(\d+)/ig, function(_, i) {
    msg.closes.push(parseInt(i, 10));
    return '';
  });

  lines.forEach(function(line) {
    match = line.match(/(?:Closes|Fixes|Resolves)\s((?:#\d+(?:\,\s)?)+)/ig);

    if (match) {
      match.forEach(function(m) {
        if (m) {
          m.split(',').forEach(function(i) {
            var issue = i.match(/\d+/);
            if (issue) {
              msg.closes.push(parseInt(issue[0], 10));
            }
          });
        }
      });
    }
  });

  match = raw.match(/BREAKING CHANGE:\s([\s\S]*)/);
  if (match) {
    msg.breaks.push(match[1] + '\n');
  }

  msg.body = lines.join('\n');
  match = msg.subject.match(COMMIT_PATTERN);

  if (!match || !match[1] || !match[4]) {
    return null;
  }

  if (match[4].length > MAX_SUBJECT_LENGTH) {
    match[4] = match[4].substr(0, MAX_SUBJECT_LENGTH);
  }

  msg.type = match[1];
  msg.component = match[3];
  msg.subject = match[4];

  return msg;
}



module.exports = {
  parseRawCommit: parseRawCommit
};
