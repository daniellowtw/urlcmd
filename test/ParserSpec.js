import parseArgs from '../js/parser.js';
import utils from '../js/util.js';

let expect = require('chai').expect;

describe('parser', function () {

  it('single word should work', function () {
    var input = "foo";
    var output = parseArgs(input);
    var expected = ['foo'];
    expect(output).to.eql(expected);
  });

  it('good case with multiple words', function () {
    var input = "foo bar car";
    var output = parseArgs(input);
    var expected = ['foo', 'bar', 'car'];
    expect(output).to.eql(expected);
  });

  it('good case with quotes', function () {
    var input = '"something else" foo';
    var output = parseArgs(input);
    var expected = ['something else', 'foo'];
    expect(output).to.eql(expected);
  });

  it('good case with single quotes', function () {
    var input = `'something else' foo`;
    var output = parseArgs(input);
    var expected = ['something else', 'foo'];
    expect(output).to.eql(expected);
  });

  it('good case with everything', function () {
    var input = `'something else' "1 + 1" -h foo`;
    var output = parseArgs(input);
    var expected = ['something else', '1 + 1', '-h', 'foo'];
    expect(output).to.eql(expected);
  });
});

describe('utils', () => {
  it('format-should-workd', () => {
    var input = ["{0}-{1}", 'abc', 'def'];
    var output = utils.format(input);
    expect(output).to.equal('abc-def');
  })
})