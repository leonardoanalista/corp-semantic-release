#!/usr/bin/env node

'use strict';


const CWD = process.cwd();
const shelljs = require('shelljs/global');
const chalk = require('chalk');
const program = require('commander');

const pkg = require('./package.json');

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




// ### STEP 1 - Work out tags
const latestTag = getLatestTag();


// ### STEP 2 - Get Commits
const jsonCommits = getJsonCommits(latestTag);


// ### STEP 3 - find out Bump type
const bumpType = whatBumpFn(jsonCommits);


// ### STEP 4 - release or not?
if (!isReleaseNecessary(bumpType, latestTag)) exit(0);


// ### STEP 5 - bump version in package.json (DESTRUCTIVE OPERATION)
const newVersion = bumpUpVersion(bumpType);

// ### STEP 6 - create CHANGELOG.md
generateChangelog();


// ### STEP 7 - Tag and push (DESTRUCTIVE OPERATION)
runPreCommitScript(program.preCommit);

//### STEP 8 - Tag and push (DESTRUCTIVE OPERATION)
addFilesAndCreateTag(newVersion);



// #################### Helpers ################### //

function runPreCommitScript(script) {
  if (script) {
    info(`>>> about to run your "pre-commit" script called $"{script}. Command is: npm run ${script}`);
    exec(`npm run ${script}`).output;
  }
}


function getLatestTag() {
  const latestTagOutput = exec('git-latest-semver-tag', {silent:true}).output.split('\n')[0];

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

function getJsonCommits(latestTag) {
  const commits = exec(`git log --no-merges --pretty=%B ${latestTag} | conventional-commits-parser`, {silent: true}).output;

  // if (program.verbose) info('>> Commits: \n', commits);

  if (!commits) {
    info('You have no commits, therefore nothing to be done here.', commits);
    exit(0);
  }

  return JSON.parse(commits);
}

// It executes the release process pipeline
function addFilesAndCreateTag(newVersion) {
  if (program.dryrun) exit(0);

  // ###### Add edited files to git #####
  info('>>> About to add and commit package.js and CHANGELOG...');
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

function generateChangelog() {
  // ###### Generate CHANGELOG contents #####
  console.log(chalk.bold.cyan('>>> about to generate CHANGELOG.md from last SemVer TAG...'));
  if (!program.dryrun) {
    let code = exec(`node ${fromNodeModule('conventional-changelog-cli/cli.js')} -p angular -i CHANGELOG.md -s`).code;
    terminateProcess(code);
  } else {
    // print out changelog in console and exit
    exec(`node ${fromNodeModule('conventional-changelog-cli/cli.js')} -p angular -i CHANGELOG.md`).output;

    exit(0); // DRY RUN STOPS HERE
  }
}


function bumpUpVersion(bumpType) {
  // ###### INCREASE VERSION #####
  if (!program.dryrun) {
    console.log(chalk.bold.cyan('>>> update version on package.json...'));
    try {
      var newVersion = exec('npm version --no-git-tag-version ' + bumpType).output.split('\n')[0];
      return newVersion;
    } catch(error) {
      terminateProcess(1);
    }
  }
}

function isReleaseNecessary(bumpType, latestTag) {
  if (!bumpType || bumpType === '') {
    success('\n\nRelease is not necessary at this point. Maybe your commits since your last tag only contains "docs", "style", "refactor", "test" and/or "chore"\n');

    info('---> YOUR LATEST TAG: ', latestTag);

    if (!program.verbose) info('Run this command again with -v or --verbose to see the commit list from last tag until HEAD.');

    if (program.verbose) {
      info('COMMIT LIST SINCE YOUR LATEST TAG:\n');
      if (latestTag.includes('HEAD')) {
        exec(`node ${fromNodeModule('git-raw-commits/cli.js')}`).output;
      } else {
        exec(`node ${fromNodeModule('git-raw-commits/cli.js')} --from ${latestTag}`).output;
      }
    }
    return false;
  } else {
    return true;
  }
}

// ### figure out bump type ###
function whatBumpFn(commits) {
  // null: no release needed
  var type = null;
  commits.every(function (commit) {

    if (commit.notes.length) {
      type = 'major';
      return false;
    }

    if (commit.type === 'feat') type = 'minor';

    if (!type && commit.type === 'fix') type = 'patch';
  });

  info('>>> Bump type is: ', type);

  return type;
}


function terminateProcess(code) {
  if (code !== 0) {
    exit(code);
  }
}

