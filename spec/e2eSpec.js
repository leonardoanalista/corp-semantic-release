'use strict';

/*
  NOTE: This is teh End-2-end test.
  - before every test: it created a git repo in a temp directory
  - test cases set pre-conditions. Eg.: commit messages, add files
  - test cases run corp-semantic-release
  - test cases will verify the state of Git
  - after every test, temp dir and git repo are deleted.
*/

var expect = require('chai').expect;
var shell = require('shelljs');
var spawn = require('child_process').spawn;
var fs = require('fs');
var readFileSync = fs.readFileSync;
var writeFileSync = fs.writeFileSync;
var temp = require('temp').track();


describe('corp-semantic-release', function () {

  // temp dir created for testing.
  // New git repo will be created here
  var tempDir;

  beforeEach(function () {
    tempDir = temp.path({prefix: 'corp-sem-rel-'});

    shell.config.silent = !process.env.npm_config_debug;
    shell.rm('-rf', tempDir);
    shell.mkdir(tempDir);
    shell.cp(__dirname + '/../testData/package.json', tempDir);

    shell.cd(tempDir);

    shell.exec('git init');

    // travis ci needs it
    shell.exec('git config user.email "leonardo@example.com"');
    shell.exec('git config user.name "Leonardo C"');
  });

  afterEach(function () {
    shell.cd(__dirname);
    shell.rm('-rf', tempDir);
    tempDir = null;
  });



  it('should not change anything in dry mode', function () {
    commitFeat();
    const out = shell.exec(`node ${__dirname}/../index.js -d`).output;

    expect(out).to.include('YOU ARE RUNNING IN DRY RUN MODE');

    // clean work directory
    const gitStatus = shell.exec(`git status`).output;
    expect(gitStatus).to.include('nothing to commit, working directory clean');
  });


  it('should bump minor version, create CHANGELOG.md file and semantic tag correctly', function () {
    commitFeat();
    shell.exec(`node ${__dirname}/../index.js -v`).output;
    const expectedVersion = '1.1.0';

    // check Semantic Tag
    expectedGitTag(expectedVersion);

    // Verify CHANGELOG.md
    let changelog = shell.exec('cat CHANGELOG.md').output;
    expect(changelog).to.include(`# ${expectedVersion} (${today})`);
    expect(changelog).to.include('### Features\n\n');
    expect(changelog).to.include('my first feature');

    expectedVersionInPackageJson(expectedVersion);
  });


  it('should run pre-commit script if required', function () {
    commitFeat();
    const out = shell.exec(`node ${__dirname}/../index.js -v --pre-commit set-version`).output;
    const expectedVersion = '1.1.0';

    expect(out).to.include(`this is my pre-commit script`);
  });

  it('should bump Major version due to Breaking Change and append contents to CHANGELOG.md', function () {
    // pre-conditions
    shell.cp(__dirname + '/../testData/CHANGELOG.md', tempDir);
    commitFeat();
    shell.exec('git tag v1.0.0');
    const expectedVersion = '2.0.0';

    // actions
    commitFixWithBreakingChange();
    shell.exec(`node ${__dirname}/../index.js -v`).output;

    // verify
    let changelog = shell.exec('cat CHANGELOG.md').output;
    expect(changelog).to.include('### BREAKING CHANGES\n\n* This should bump major');
    expect(changelog).to.include(`# [2.0.0](//compare/v1.0.0...v${expectedVersion}) (${today})`);

    expectedVersionInPackageJson(expectedVersion);

  });


  it('should detect release is not necessary', function () {
    commitNonReleaseTypes();
    const out = shell.exec(`node ${__dirname}/../index.js -v`).output;

    expect(out).to.include('Release is not necessary at this point');

    // clean work directory
    const gitStatus = shell.exec(`git status`).output;
    expect(gitStatus).to.include('nothing to commit, working directory clean');
  });



  // ####### Helpers ######

  function commitFeat() {
    writeFileSync('feat.txt', '');
    commitWithMessage('feat: my first feature');
  }

  function commitNonReleaseTypes() {
    writeFileSync('docs.txt', '');
    commitWithMessage('docs: commit 01');

    writeFileSync('styles.txt', '');
    commitWithMessage('styles: commit 02');

    writeFileSync('chore.txt', '');
    commitWithMessage('chore: commit 03');
  }


  function commitFixWithBreakingChange() {
    writeFileSync('fix.txt', '');
    const msg = `-m "fix: issue in the app" -m "BREAKING CHANGE:" -m "This should bump major"`;

    commitWithMessageMultiline(msg);
  }

  function commitWithMessage(msg) {
    shell.exec(`git add --all && git commit -m "${msg}"`);
  }

  function commitWithMessageMultiline(msg) {
    shell.exec(`git add --all && git commit ${msg}`);
  }

  const today = new Date().toISOString().substring(0, 10);


  function expectedGitTag(expectedVersion) {
    // check for new commit
    let gitLog = shell.exec('git log | cat').output;
    expect(gitLog).to.include(`chore(release): ` + `v` + `${expectedVersion}`);

    let gitTag = shell.exec('git tag | cat').output;
    expect(gitTag).to.include('v' + expectedVersion);
  }

  function expectedVersionInPackageJson(expectedVersion) {
    var newVersion = require(tempDir + '/package.json').version;
    expect(newVersion).to.equal(expectedVersion);
  }

});
