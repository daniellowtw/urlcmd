// A bundle: importing this pulls in all four Unix timestamp units at once.
//   import-all examples/timestamp.js
//
// Each name maps to the single-command module timestamp-unit.js, which picks its
// unit from the name it's imported under. To grab just one unit instead, import
// the leaf module directly, e.g. `import secs examples/timestamp-unit.js`.
function timestamp(name, utils) {
    return {
        bundle: {
            secs:  "examples/timestamp-unit.js",
            msecs: "examples/timestamp-unit.js",
            usecs: "examples/timestamp-unit.js",
            nsecs: "examples/timestamp-unit.js",
        },
    };
}
