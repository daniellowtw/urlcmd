declare var test: any, expect: any;
import { parseArgs } from '../parser';

test('parse args handle simple case', () => {
    expect(parseArgs(`a b c`)).toEqual(['a', 'b', 'c']);
});

test('parse args handle double quote case', () => {
    expect(parseArgs(`a "b c"`)).toEqual(['a', 'b c']);
});

test('parse args handle double quote multiple characters case', () => {
    expect(parseArgs(`a "b 123 c"`)).toEqual(['a', 'b 123 c']);
});

test('parse args handle double quote multiple characters case', () => {
    expect(parseArgs(`"ax by cz dw"`)).toEqual(['ax by cz dw']);
});

