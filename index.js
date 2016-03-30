#!/usr/bin/env node

'use strict';


const CWD = process.cwd();
const shelljs = require('shelljs/global');
const chalk = require('chalk');
const program = require('commander');
const pkg = require('./package.json');

const path = require('path');
const fs = require('fs');
var prependFile = require('prepend-file');

const _errorFn = chalk.bold.red;
const _successFn = chalk.bold.green;
const _infoFn = chalk.bold.cyan;
const LOG = console.log;

// var code; //exit code for shell commands. If it is !== 0 we abort the process.

// TODO: change to spread operator and default param value when node supports
const info = function(msg, obj) {
  obj = obj || '';
  LOG(_infoFn(msg), obj);
};
const success = function(msg, obj) {
  obj = obj || '';
  LOG(_successFn(msg), obj);
};
const error = function(msg, obj) {
  obj = obj || '';
  LOG(_errorFn(msg), obj);
};


program
  .version(pkg.version)
  .option('-d, --dryrun', 'No changes to workspace. Stops after changelog is printed.')
  .option('--pre-commit [pre-commit]', 'Pre-commit hook [pre-commit]. Pass a string with the name of the npm script to run. it will run like this: npm run [pre-commit]')
  .option('-v, --verbose', 'Prints debug info')
  .parse(process.argv);


if (program.dryrun) {
  console.info(chalk.bold.bgGreen.white('>> YOU ARE RUNNING IN DRY RUN MODE. NO CHANGES WILL BE MADE <<'));
}


try {
  fs.statSync('package.json');
} catch (e) {
  error('Cant find your package.json.');
  exit(1);
}



// ### STEP 1 - Work out tags
const latestTag = getLatestTag();

// ### STEP 2 - Get Commits
const jsonCommits = getJsonCommits(latestTag);

// ### STEP 3 - find out Bump type
const bumpType = whatBumpFn(jsonCommits);

// ### STEP 4 - release or not?
if (!isReleaseNecessary(bumpType, jsonCommits)) {
  exit(0);
}


// ### STEP 5 - bump version in package.json (DESTRUCTIVE OPERATION)
const newVersion = bumpUpVersion(bumpType);


// ### STEP 6 - ger changelog contents
const changes = getChangelog();

// ### STEP 7 - Write or Append (DESTRUCTIVE OPERATION)
writeChangelog(changes); //it has to run after the version has been bumped.


// ### STEP 8 - Run if any pre commit script has been specified (DESTRUCTIVE OPERATION)
runPreCommitScript(program.preCommit);

// ### STEP 9 - Tag and push (DESTRUCTIVE OPERATION)
addFilesAndCreateTag(newVersion);


// #################### Helpers ################### //


function getJsonCommits(latestTag) {
  var rawCommits = exec(`git log -E --format=%H==SPLIT==%B==END== ${latestTag}`, {silent: true}).output;

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
    var gitUtils = require('./gitUtils');
    return gitUtils.parseRawCommit(commit.hash + '\n' + commit.message);
  }).filter(function (commit) {
    return !!commit;
  });

  return parsedCommits;
}

function whatBumpFn(parsedCommits) {
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

  info('>>> Bump type is', type);
  return type;
}

function isReleaseNecessary(bumpType, parsedCommits) {
  if (!bumpType || bumpType === '') {
    success('\n\nRelease is not necessary at this point. Maybe your commits since your last tag only contains "docs", "style", "refactor", "test" and/or "chore"\n');

    info('---> YOUR LATEST TAG: ', latestTag);
    if (!program.verbose) info('Run this command again with -v or --verbose to see the commit list from last tag until HEAD.');

    if (program.verbose) {
      info('PARSED COMMIT LIST SINCE YOUR LATEST TAG:\n');

      info('>>> parsedCommits: ', parsedCommits);
    }

    return false;
  } else {

    return true;
  }
}


function getChangelog() {
  const data = exec(`node ${fromNodeModule('conventional-changelog/cli.js')} -p angular`, {silent: true}).output;

  if (program.dryrun) {
    info('>>> Future and additional contents of CHANGELOG.md: \n', data);
  }

  return data;
}

function writeChangelog(data) {
  if (program.dryrun) return;

  var writeFileSync = fs.writeFileSync;

  if (program.verbose) info('>>> About to write/append contents to CHANGELOG.md... ');

  var fileName = path.join(process.cwd(), 'CHANGELOG.md');

  prependFile.sync(fileName, data);
}


function runPreCommitScript(script) {
  if (script) {
    info(`>>> about to run your "pre-commit" script called "${script}". Command is: npm run ${script}`);
    exec(`npm run ${script}`).output;
  }
}


function getLatestTag() {
  const latestTagOutput = exec(`node ${fromNodeModule('git-latest-semver-tag/cli.js')}`, {silent: false}).output.split('\n')[0];

  let latestTag;
  if (!latestTagOutput.startsWith('v')) {
    latestTag = 'HEAD';
    info('>> No SemVer tag found. It seems like your first release?');
  } else {
    latestTag = latestTagOutput + '..HEAD';

    if (program.verbose) info('>> Your latest semantic tag is: ', latestTag);
  }

  return latestTag;
}


// It executes the release process pipeline
function addFilesAndCreateTag(newVersion) {
  if (program.dryrun) exit(0);

  // ###### Add edited files to git #####
  info('>>> About to add and commit package.json and CHANGELOG...');
  var code = exec('git add package.json CHANGELOG.md').code;
  terminateProcess(code);


  // ###### TAG NEW VERSION #####
  info(`>> Time to create the Semantic Tag: ${newVersion}`);
  var code = exec('git tag ' + newVersion).code;
  terminateProcess(code);

  // ###### Commit files #####
  var code = exec('git commit -m "chore(release): ' + newVersion + '"').code;
  terminateProcess(code);

  info('>>...and push to remote...');
  exec('git push --tags').output;
}



function fromNodeModule(value) {
  return `${__dirname}/node_modules/${value}`;
}


function bumpUpVersion(bumpType) {
  // ###### INCREASE VERSION #####
  if (!program.dryrun) {
    console.log(chalk.bold.cyan('>>> update version on package.json...'));
    try {
      var newVersion = exec('npm version --no-git-tag-version ' + bumpType).output.split('\n')[0];
      return newVersion;
    } catch (error) {
      terminateProcess(1);
    }
  }

}


function terminateProcess(code) {
  if (code !== 0) {
    exit(code);
  }
}

