// A single Unix timestamp command, unit chosen by the alias name you import it
// under (secs / msecs / usecs / nsecs). Usually you'd grab all four at once via
// the bundle (`import-all x/timestamp.js`), but you can import just one:
//   import secs x/timestamp-unit.js
//
// `gen` is built with `new Function` (rather than a closure) so the baked-in
// values survive the serialize/re-eval that import does. The math uses BigInt so
// micro/nanosecond "now" values stay exact — they exceed JS's safe integer range
// otherwise.
//
// num/den is milliseconds-per-unit as a fraction:
//   ms   = value * num / den        (parsing a timestamp -> a date)
//   now  = Date.now() * den / num   (current time in the chosen unit)
function timestampUnit(name, utils) {
    var units = {
        secs:  { num: 1000, den: 1,       label: "seconds" },
        msecs: { num: 1,    den: 1,       label: "milliseconds" },
        usecs: { num: 1,    den: 1000,    label: "microseconds" },
        nsecs: { num: 1,    den: 1000000, label: "nanoseconds" },
    };
    var u = units[name] || units.secs;
    return {
        "desc": "Unix timestamp conversion (" + u.label + ")",
        "usage": name + " [timestamp]",
        "example": name + " -> now, " + name + " 1700000000 -> date",
        "gen": new Function("q",
            "var num = " + u.num + "n, den = " + u.den + "n;\n" +
            "if (!q) { return { text: (BigInt(Date.now()) * den / num).toString() }; }\n" +
            "return { text: '' + new Date(Number(BigInt(q) * num / den)) };"
        ),
    };
}
