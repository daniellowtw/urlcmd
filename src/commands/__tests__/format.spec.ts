declare var test: any, expect: any;
import { parseArgs } from '../parser';
import { format } from '../command';

test('format with as many values as placeholders', () => {
    const actual = format("ab{0}cd{1}def", ["1", "2"]);
    expect(actual).toEqual("ab1cd2def");
});

test('format with more values than placeholders should ignore extra values', () => {
    const actual = format("ab{0}cd{1}def", ["1", "2", "3"]);
    expect(actual).toEqual("ab1cd2def");
});

test('format with fewer values than placeholders should use empty string', () => {
    const actual = format("ab{0}cd{1}def", ["1"]);
    expect(actual).toEqual("ab1cddef");
});

test('format should handle spaces with url encoding', () => {
    const actual = format("ab{0}ab", ["1 2"], true);
    expect(actual).toEqual("ab1%202ab");
});

test('format should handle spaces without url encoding', () => {
    const actual = format("ab{0}ab", ["1 2"], false);
    expect(actual).toEqual("ab1 2ab");
});

