'use strict';

const addFilesAndCreateTag = require('./addFilesAndCreateTag');
const bumpUpVersion = require('./bumpUpVersion');
const getJsonCommits = require('./getJsonCommits');
const getLatestTag = require('./getLatestTag');
const helpers = require('./helpers');
const isReleaseNecessary = require('./isReleaseNecessary');
const parseRawCommit = require('./parseRawCommit');
const runScript = require('./runScript');
const validateBranch = require('./validateBranch');
const whatBump = require('./whatBump');
const writeChangelog = require('./writeChangelog');
const log = require('./log');

module.exports = {
  addFilesAndCreateTag,
  bumpUpVersion,
  getJsonCommits,
  getLatestTag,
  helpers,
  isReleaseNecessary,
  parseRawCommit,
  runScript,
  validateBranch,
  whatBump,
  writeChangelog,
  log,
};
