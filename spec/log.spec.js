const log = require('../src/lib/log');
const expect = require('chai').expect;
const chalk = require('chalk');
const stdout = require('test-console').stdout;

describe('log', () => {

  let testData = [
    {desc: 'info', fn: log.info, colour: 'blue', colourFn: chalk.bold.cyan},
    {desc: 'success', fn: log.success, colour: 'green', colourFn: chalk.bold.green},
    {desc: 'announce', fn: log.announce, colour: 'white', colourFn: chalk.bold.bgGreen.white},
    {desc: 'error', fn: log.error, colour: 'red', colourFn: chalk.bold.red},
  ];

  testData.forEach(test => {

    describe(test.desc, () => {
      it(`should generate a ${test.colour} message`, () => {
        let output = stdout.inspectSync(() => {
          test.fn('foo');
        });
        expect(output[0]).to.equal(test.colourFn('foo') + ' \n');
      });

      it(`should generate a ${test.colour} message and append data`, () => {
        let output = stdout.inspectSync(() => {
          test.fn('foo', 'bar');
        });
        expect(output[0]).to.equal(test.colourFn('foo') + ' bar\n');
      });
    });
  });

});
