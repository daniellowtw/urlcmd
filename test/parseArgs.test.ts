// Tests for parseArgs. Imported straight from source (src/parseArgs.ts), so the
// tests are independent of the compiled/minified build output.
import { test, expect } from "bun:test";
import { parseArgs } from "../src/parseArgs";

test("splits plain space-separated words", () => {
  expect(parseArgs("foo bar car")).toEqual(["foo", "bar", "car"]);
});

test("single word", () => {
  expect(parseArgs("foo")).toEqual(["foo"]);
});

test("keeps a quoted phrase together", () => {
  expect(parseArgs('foo "bar car" baz')).toEqual(["foo", "bar car", "baz"]);
});

test("quoted phrase at the end", () => {
  expect(parseArgs('foo "bar car"')).toEqual(["foo", "bar car"]);
});

test("quoted phrase at the start", () => {
  expect(parseArgs('"bar car" baz')).toEqual(["bar car", "baz"]);
});

test("whole string quoted", () => {
  expect(parseArgs('"bar car baz"')).toEqual(["bar car baz"]);
});

test("single quoted word", () => {
  expect(parseArgs('"bar"')).toEqual(["bar"]);
});

test("multiple quoted phrases", () => {
  expect(parseArgs('"a b" "c d"')).toEqual(["a b", "c d"]);
});
