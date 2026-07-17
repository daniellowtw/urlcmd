// Opt-in Google Translate command. Enable it with:
//   import tr x/translate.js
//
// Note: imported gen functions are serialized (Function.toString) and re-run in
// isolation, so this must be self-contained — no closures over `name`/`utils`,
// no `this`, and args arrive spread as positional params (not one raw string),
// so we re-join them.
function translate(name, utils) {
    return {
        "cmd": "tr", // suggested default name (used by the Extensions list)
        "desc": "Google Translate",
        "usage": name + " [[from]:[to]] text",
        "example": "Example: " + name + " ro:fr buna ziua",
        "gen": function() {
            var q = [].slice.call(arguments).join(" ");
            if (!q) {
                return { text: "Example: tr ro:fr buna ziua" };
            }
            var components = q.match(/^(([a-zA-Z\-]*):([a-zA-Z\-]*)\s+)?(.*$)/);
            var from = components[2] || 'auto';
            var to = components[3] || 'en';
            var text = components[4];
            return {
                url: "https://translate.google.com/#view=home&op=translate&sl=" + from + "&tl=" + to + "&text=" + encodeURIComponent(text)
            };
        },
    };
}
