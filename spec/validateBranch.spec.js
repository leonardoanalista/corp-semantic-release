'use strict';
const expect = require('chai').expect;
const rewire = require('rewire');
const stdout = require('test-console').stdout;
const validateBranch = rewire('../src/lib/validateBranch'); // NOTE: rewired!

describe('validateBranch', () => {
  let revert = () => {};

  afterEach(() => revert()); // revert the mocking of anything

  it('should show a message if the current branch is not the release branch and exit with 0', () => {
    let exitCode;
    revert = validateBranch.__set__({
      shell: {
        exec: () => ({stdout: 'fooBranch\n'}),
        exit: (code) => {
          exitCode = code;
          return;
        },
      },
    });

    let output = stdout.inspectSync(() => {
      validateBranch('bar');
    });

    expect(output[0]).to.include(`You can only release from the bar branch. Use option --branch to specify branch name.`);
    expect(exitCode).to.equal(0);
  });


  it('should show an info message if the current branch matches the release branch', () => {
    let exitCalled = false;
    revert = validateBranch.__set__({
      shell: {
        exec: () => ({stdout: 'fooBranch\n'}),
        exit: () => exitCalled = true,
      },
    });

    let output = stdout.inspectSync(() => {
      validateBranch('fooBranch');
    });

    expect(output[0]).to.include(`>>> Your release branch is: fooBranch`);
    expect(exitCalled).to.equal(false); // exit() is never called
  });

  it('should allow release from any branch when option --branch is "*"', () => {
    let exitCalled = false;

    revert = validateBranch.__set__({
      shell: {
        exit: () => exitCalled = true,
      },
    });

    const result = validateBranch('*');

    expect(result).to.equal(null);
    expect(exitCalled).to.equal(false);
  });
});
