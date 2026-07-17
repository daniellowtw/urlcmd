// Tests for parseArgs, defined in src/main.ts (compiled to js/main.js).
// Run with: bun test  (build first, or use `just test`).
//
// We can't `import` the module because it executes browser-only bootstrap code
// at load time. Instead we extract the parseArgs function source from the
// compiled output and eval it, so these tests exercise the real shipped code.

import { test, expect } from "bun:test";
import { readFileSync } from "fs";

const src = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");

// Extract `function parseArgs(...) { ... }` by matching balanced braces.
function extractFunction(source, name) {
  const start = source.indexOf("function " + name);
  if (start === -1) throw new Error("could not find function " + name);
  let i = source.indexOf("{", start);
  let depth = 0;
  for (; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error("unbalanced braces for " + name);
}

const parseArgs = new Function(
  extractFunction(src, "parseArgs") + "\nreturn parseArgs;"
)();

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
