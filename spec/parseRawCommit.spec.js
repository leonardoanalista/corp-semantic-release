'use strict';

const parseRawCommit = require('../src/lib/parseRawCommit');
const expect = require('chai').expect;

describe('parseRawCommit', () => {
  const HASH = '012345HASH';
  const SUBJECT = 'subject';
  const BODY = 'body';
  const FOOTER = 'footer';

  it('should parse a "normal" feature commit', () => {
    const commit = `${HASH}\nfeat(scope): ${SUBJECT}\n\n${BODY}\n\n${FOOTER}`;

    const msg = parseRawCommit(commit);

    expect(msg).not.equal(null);
    expect(msg.hash).to.equal(HASH);
    expect(msg.subject).to.equal(SUBJECT);
    expect(msg.body).to.equal(`\n${BODY}\n\n${FOOTER}`);
    expect(msg.type).to.equal('feat');
    expect(msg.component).to.equal('scope');
  });

  it('should not parse a feature commit with a scope which contains a "/" to be consistent with other commit message parsing tools', () => {
    const commit = `${HASH}\nfeat(scope/foo): ${SUBJECT}\n\n${BODY}\n\n${FOOTER}`;

    const msg = parseRawCommit(commit);

    expect(msg).to.equal(null);
  });
});
