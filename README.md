# corp-semantic-release.

Corporate semantic release for private projects under corporation network.

It has almost all expected features from [semantic-release](https://github.com/semantic-release/semantic-release) but will not publish to **npmjs** at the end.

Obviously this project is **100%** inspired by semantic release. This module is not supposed to replace its parent. First try to use semantic-release. If you have special requirements under corporate network, then this module is made for you. Ironically this module uses semantic-release as I don't have any stupid restrictions at my home network.



[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)[![Build Status](https://travis-ci.org/leonardoanalista/corp-semantic-release.svg)](https://travis-ci.org/leonardoanalista/corp-semantic-release)[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)[![npm monthly downloads](https://img.shields.io/npm/dm/corp-semantic-release.svg?style=flat-square)](https://www.npmjs.com/package/corp-semantic-release)



## Actions performed

* Detect if a release is required. If not, exit(0);
* Figure out type of bump as usual: Major, minor or patch
* Read your commits from last semantic tag and generate or append contents to `CHANGELOG.md` file.
* bump your `package.json` only
* run `git add package.json CHANGELOG.md`
* run any `pre-commit` script, if specified
* run `git commit -m "chore(build): release v1.0.0"`
* run `git tag v1.0.0`
* run `git push`
* run `git push --tags`


## Install
run: `npm install corp-semantic-release --save-dev`

## Configure

This tool installs itself as a `bin`. After installation, you have this command `corp-semantic-release` available from anywhere.

Add this script to your `package.json`

```
  "scripts": {
    "corp-release": "corp-semantic-release [options here]"
  }
```

Of course you can change `corp-release` to any name you like.


## Options
* `-d` or `--dryrun`: it runs in non-destructive mode. No alteration should be done in your workspace.
* '--pre-commit [pre-commit]': Pre-commit hook [pre-commit]. Pass a string with the name of the npm script to run. it will run like this: `npm run [pre-commit]`. If you need more hooks to be implemented please open an issue.
* -b [branch] or --branch [branch]: Branch name allowed to run release. Default is master. If you want to release from another branch, you need to specify.
* `-v` or `--verbose`: it prints extra info such as commit list from last tag and command details.

**NOTE**: if you run via `npm`, you have to add `--` before the options so npm passes all arguments to node. Eg.:

`npm run corp-release -- -v -d`


## Contribute

Please refer to the [Contributor Guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md) and [Conduct of Code](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md) from [AngularJs](https://github.com/angular/angular.js) project.


## TODO - Roadmap:
* split cli tool and write unit tests for functions.
* add option to create release on Enterprise GitHub using API v3. I am sure one day the corps will be using version 3.
* make code fully functional with Immutable.js and Ramda.


## FAQ

### I work in a corporation and proxy there is a pain in the azz?
This npm module is for you. I was unable to pass the setup stage of `semantic-release` inside a corporation network. That was one of the reasons why I created this package.

### how can I setup `corp-semantic-release`?
run `npm install corp-semantic-release`. There is no wizard like semantic-release.

### Can I trust 'corp-semantic-release'?
Take a look at the file `test/e2eSpec.js`. It has comprehensive e2e tests in order to make sure it works as expected.

### how is the pipeline of actions different to `semantic-release`?
`corp-semantic-release` will not publish to `npmjs.com`. Take a look at the file `index.js`. It contains a pipiline of actions like this:

```
// ### STEP [1] - Work out tags
...

// ### STEP [n] - Get Commits
const jsonCommits = getJsonCommits(latestTag);

```

### I can't get over: I really have corporate proxies.

I totally understand your frustrations and you are not the only one. Proxy settings is not the purpuse of this project but I am happy to provide some help if I can. I use `cntlm` as reverse proxy. I also **turn off ssl on npm**. This is how I get things working. If you need further instructions on cntlm, send me a message.
