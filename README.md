<!--[RM_HEADING]-->
# corp-semantic-release

<!--[]-->

> [Semantic-release](https://github.com/semantic-release/semantic-release) for repositories that are inside private networks (e.g. corporations)
  or for non-GitHub repositories.

It has almost all expected features from [semantic-release](https://github.com/semantic-release/semantic-release) but will **not** publish to an NPM registry at the end.

Obviously this project is **100%** inspired by semantic release. This module is **not** supposed to replace its parent. First try to use semantic-release. If you have special requirements under corporate network, then this module is made for you. Ironically this module uses semantic-release as I don't have any stupid network restrictions at my home.


[![NPM Version](https://img.shields.io/npm/v/corp-semantic-release.svg?style=flat-square)](http://npm.im/corp-semantic-release)
[![Build Status](https://travis-ci.org/leonardoanalista/corp-semantic-release.svg)](https://travis-ci.org/leonardoanalista/corp-semantic-release)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Coverage Status](https://coveralls.io/repos/github/leonardoanalista/corp-semantic-release/badge.svg?branch=master)](https://coveralls.io/github/leonardoanalista/corp-semantic-release?branch=master)
[![Dependencies status](https://david-dm.org/leonardoanalista/corp-semantic-release/status.svg?theme=shields.io)](https://david-dm.org/leonardoanalista/corp-semantic-release#info=dependencies)
[![Dev-dependencies status](https://david-dm.org/leonardoanalista/corp-semantic-release/dev-status.svg?theme=shields.io)](https://david-dm.org/leonardoanalista/corp-semantic-release#info=devDependencies)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm monthly downloads](https://img.shields.io/npm/dm/corp-semantic-release.svg?style=flat-square)](https://www.npmjs.com/package/corp-semantic-release)

## Actions performed

* Detect if a release is required. If not, exit(0);
* Figure out type of bump as usual: Major, minor or patch
* Read your commits from last semantic tag and generate or append contents to `CHANGELOG.md` file.
* bump your `package.json`
* run `git add package.json CHANGELOG.md`
* run any `pre-commit` script, if specified
* run `git commit -m "chore(build): release v1.0.0"`
* run `git tag v1.0.0`
* run `git push`
* run `git push --tags`


## Install

    npm install corp-semantic-release --save-dev


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
* `--pre-commit [npm-script]`: Pre-commit hook. Pass the name of the npm script to run. It will run like this: `npm run [npm-script]`.
* `--post-success [command]`: Post-success hook (after `git push` completes successfully). Pass a command to run as the argument. Eg: `--post-success "npm publish"`.
* `-b [branch]` or `--branch [branch]`: Branch name allowed to run release. Default is `master`. If you want to release from another branch, you need to specify. Use "*" to allow any branch - Useful for Jenkins as git does a revision check-out.
* `-v` or `--verbose`: it prints extra info such as commit list from last tag and command details.
* `--changelogpreset [preset]`: The conventional-changelog preset to use. Default is `angular`. `angular-bitbucket` is available for [BitBucket repositories](https://github.com/uglow/conventional-changelog-angular-bitbucket). Other presets can be installed, e.g: `npm i conventional-changelog-jquery` then pass this flag to the command: `--changelogpreset jquery`.
* `-r [num]` or `--releasecount [num]`: How many releases of changelog you want to generate. It counts from the upcoming release. Useful when you forgot to generate any previous changelog. Set to 0 to regenerate all (will overwrite any existing changelog!).
* `--tagPrefix [tag name]`: Gives the tag version a prefix such as ALPHA 1.1.2.

**NOTE**: If you run via `npm`, you have to add `--` before the options so npm passes all arguments to node. Eg.: `npm run corp-release -- -v -d`


## Updating other files
A pretty common requirement when updating the version number is to update other files with
the same version number. There are two ways you can run your own scripts to update additional files:

<details>
<summary>Option 1 - NPM hook</summary>
You can use NPM's built-in `(pre|post)version` [script-hook](https://docs.npmjs.com/cli/version) to run code before/just-after/after `package.json` is modified by `corp-semantic-release`.

In the following example, `updateOtherFiles.js` does *NOT* receive the version as an argument but must query `package.json` to get the bumped version.
```json

"scripts": {
  "corp-release": "corp-semantic-release",
  "version": "node updateOtherFiles.js"
}

```
</details>


<details>
<summary>Option 2 - `--pre-commit [npm-script]`</summary>
`corp-semantic-release` also provides a `--pre-commit <NPM script>` option. The NPM script is passed the version
number as an argument to the script.

```json

"scripts": {
  "corp-release": "corp-semantic-release --pre-commit updateFiles",
  "updateFiles": "node updateOtherFiles.js"
}

```
</details>

Remember to stage the files using `git add <file-name>` after modifying the files, so that when `corp-semantic-release` commits the changes, all the changed files are commited.


## Contribute

Please refer to the [Contributor Guidelines](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md) and [Conduct of Code](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md) from [AngularJs](https://github.com/angular/angular.js) project.


## TODO - Roadmap:
* add option to create release on Enterprise GitHub using API v3. I am sure one day the corps will be using version 3.
* Write functional code.

## FAQ

### I work in a corporation which has a network proxy which is a pain in the azz. What should I do?
This NPM module is for you! I was unable to pass the setup stage of `semantic-release` inside a corporation network. That was one of the reasons why I created this package.

### How do I setup `corp-semantic-release`?
Run `npm install corp-semantic-release`. There is no setup wizard like the `semantic-release` package has. Simple!

### Can I trust 'corp-semantic-release'?
Take a look at the file `test/e2e.spec.js`. It has comprehensive system tests in order to make sure it works as expected.

### Are the pipeline-of-actions different to `semantic-release`?
Yes. Importantly, `corp-semantic-release` will *not* attempt to publish to an NPM registry.

Actions performed:

1. Validate that the current branch is the release branch.
1. Determine the current version number (from the latest git tag).
1. Get the commit history since the latest git tag.
1. Determine the new semantic version number from the commit history.
1. Decide whether a release is required or not. If not, exit.
1. Update `package.json` with the new version number.
1. Update or create `CHANGELOG.md` with the relevant log entries (from the commit history).
1. Run pre-commit scripts.
1. Commit file changes to git, create git tag then push all changes (including tags).


### What else is different to `semantic-release`?
`corp-semantic-release`, at the moment, generetes and appends changelog contents to a file called CHANGELOG.md.

### I just can't get over it - I really hate corporate proxies!

I totally understand your frustrations and you are not the only one. Proxy settings is not the focus of this project
but I am happy to provide some help if I can. I use `cntlm` as reverse proxy. I also **turn off ssl on npm**.
This is how I get things working. If you need further instructions on cntlm, send me a message.


<!--[RM_LICENSE]-->
## License

This software is licensed under the MIT Licence. See [LICENSE](LICENSE).

<!--[]-->

