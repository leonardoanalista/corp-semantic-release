# corp-semantic-release.

Corporate semantic release for private projects under corporation network.

It contains all expected features by [semantic-release](https://github.com/semantic-release/semantic-release) but will not publish to **npmjs** at the end.

Obviously this project is 100% inspired by semantic release.


## Actions performed

* Detect if a release is required. If not, exit(0);
* Figure out type of bump as usual: Major, minor or patch
* Read your commits from last semantic tag and generate or append contents to `CHANGELOG.md` file.
* bump your `package.json` only
* run `git add package.json CHANGELOG.md`
* run `git commit -m "chore(build): release v1.0.0"`
* run `git tag v1.0.0`
* run `git push`
* run `git push --tags`


## Install
run: `npm install corp-semantic-release --save-dev`

## Configure

Add this script to your `package.json`

```
  "scripts": {
    "release": "node ./node_modules/index.js"
  }
```
Of course you can give any name you like.

## Options
* `-d` or `--dryrun`: it runs in non-destructive mode. No alteration hsould be done in your workspace.
* `-v` or `--verbose`: it prints extra info such as commit list from last tag and command details.

**NOTE**: if you run via `npm`, you have to add `--` before the options so npm passes all arguments to node. Eg.:

`npm run release -- -v -d`


## Contribute
As usual, the same as [cz-customizable](https://github.com/leonardoanalista/cz-customizable#contributing) and any other project I work on.


# TODO - Roadmap:
* build cli tool (I am reading up to learn this)
* add option to create release on GitHub using API v3. I am sure one day the corps will be using version 3.
* write unit tests
* make code fully functional with Immutable.js and Ramda.

