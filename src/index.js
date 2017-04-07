#!/usr/bin/env node
'use strict';

const lib = require('./lib');
const log = require('./lib').log;
const shell = require('shelljs');
const program = require('commander');
const fs = require('fs');
const through = require('through2');
let changelog = require('conventional-changelog');
let async = require('async');
let stream = require('stream');


try {
  fs.statSync(process.cwd() + '/package.json');
} catch (e) {
  log.error('Cant find your package.json.');
  shell.exit(1);
}

const pkg = require(process.cwd() + '/package.json');
const oldVersion = pkg.version;

if (!pkg.name || !oldVersion) {
  log.error('Minimum required fields in your package.json are name and version.');
  shell.exit(1);
}

program
  .version(oldVersion)
  .option('-d, --dryrun', 'No changes to workspace. Stops after changelog is printed.')
  .option('--pre-commit [pre-commit]', 'Pre-commit hook [pre-commit]. Pass a string with the name of the npm script to run. it will run like this: npm run [pre-commit]')
  .option('-b, --branch [branch]', 'Branch name [branch] allowed to run release. Default is master. If you want another branch, you need to specify.')
  .option('-v, --verbose', 'Prints debug info')
  .option('--changelogpreset [preset]', 'The conventional-changelog preset to use. Default is angular. angular-bitbucket' +
    ' is available for BitBucket repositories. Other presets can be installed: npm i conventional-changelog-jquery')
  .option('-r, --releasecount [number]', 'How many releases of changelog you want to generate.', parseInt)
  .parse(process.argv);

if (program.dryrun) {
  log.announce('>> YOU ARE RUNNING IN DRY RUN MODE. NO CHANGES WILL BE MADE <<');
}

program.branch = program.branch || 'master';
program.changelogpreset = program.changelogpreset || 'angular';
// Release count defaults to 1 (generate 1 release), but could be 0 (hence logic). See https://github.com/conventional-changelog/conventional-changelog-core#releasecount
program.releasecount = (program.releasecount != undefined) ? program.releasecount : 1;

let version;

// ### STEP 0 - Validate branch
lib.validateBranch(program.branch);
// ### STEP 1 - Work out tags
const latestTag = lib.getLatestTag(program.verbose);
// ### STEP 2 - Get Commits
const jsonCommits = lib.getJsonCommits(latestTag);
// ### STEP 3 - find out Bump type
const bumpType = lib.whatBump(jsonCommits);
// ### STEP 4 - release or not?
if (!lib.isReleaseNecessary(bumpType, latestTag, jsonCommits, program.verbose)) {
  shell.exit(0);
}

// ### STEP 5 - bump version in package.json (DESTRUCTIVE OPERATION - but we remember the old version and restore at the end)
version = lib.bumpUpVersion(bumpType, latestTag);

async.series([
  // ### STEP 6 - get changelog contents
  function(callback) {
    let contentStream = new stream.Writable();
    let data = [];

    contentStream._write = function(chunk) {
      callback(null, chunk.toString());
    };


    // here we can add the options in the future:
    // (options, context, gitRawCommitsOpts, parserOpts, writerOpts);
    let options = {
      preset: program.changelogpreset,
      releaseCount: program.releasecount,
    };
    changelog(options)
      // Use through() to handle multiple chunks which could be returned from changelog()
      .pipe(through({
        objectMode: true,
      }, function(chunk, enc, cb) {
        try {
          data.push(chunk);
        } catch (err) {
          setImmediate(function() {
            throw err;
          });
        }

        cb();
      }, function(cb) {
        // This function is called once ALL the object-chunks have been processed.
        data.push(null);

        cb(null, data.join(''));    // Pass the data to the next stream processor
      }))
      .pipe(contentStream);
  },
],
function(err, results) {
  const changes = results[0];

  // ### STEP 7 - Write or Append (DESTRUCTIVE OPERATION)
  if (!program.dryrun) {
    lib.writeChangelog(changes, program.releasecount === 0, program.verbose); // it has to run after the version has been bumped.
  } else {
    log.info('>>> Changelog contents would have been: \n\n', changes);

    // Ensure old package version is restored
    log.info('>>> Resetting package.json to original version');
    shell.exec('npm version --no-git-tag-version ' + oldVersion);
  }

  // ### STEP 8 - Run if any pre commit script has been specified (DESTRUCTIVE OPERATION)
  lib.runPreCommitScript(program.preCommit, version);
  // ### STEP 9 - Tag and push (DESTRUCTIVE OPERATION)
  if (!program.dryrun) lib.addFilesAndCreateTag(version);
});
