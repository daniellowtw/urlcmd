// A bundle: importing this pulls in all four Unix timestamp units at once.
//   import-all x/timestamp.js
//
// Each name maps to the single-command module timestamp-unit.js, which picks its
// unit from the name it's imported under. To grab just one unit instead, import
// the leaf module directly, e.g. `import secs x/timestamp-unit.js`.
function timestamp(name, utils) {
    return {
        bundle: {
            secs:  "x/timestamp-unit.js",
            msecs: "x/timestamp-unit.js",
            usecs: "x/timestamp-unit.js",
            nsecs: "x/timestamp-unit.js",
        },
    };
}
