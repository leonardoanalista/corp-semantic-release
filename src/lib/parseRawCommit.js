'use strict';

module.exports = function parseRawCommit(raw) {
  const COMMIT_PATTERN = /^(\w*)(\(([\w\$\.\-\* ]*)\))?\: (.*)$/;
  const MAX_SUBJECT_LENGTH = 80;

  if (!raw) {
    return null;
  }

  let lines = raw.split('\n');
  let msg = {};
  let match;

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
            let issue = i.match(/\d+/);
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
};
