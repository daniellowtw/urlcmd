// Generates css/app.css: Bulma with every rule the app never uses stripped out.
//
// css/bulma.min.css is the untouched full framework (the source). This reads it
// fresh every run and scans the actual markup (index.html + the compiled
// js/main.js, where all class strings live) to keep only the rules in use, then
// writes the trimmed result to css/app.css, which index.html loads.
//
// Because purge is subtractive, always read from the FULL bulma.min.css here —
// never from a previously-purged file — or the trimming would compound.
//
// Both files are committed: GitHub Pages serves the repo directly with no build
// step, so the generated css/app.css must be in the repo like js/main.js.
import { PurgeCSS } from "purgecss";

const result = await new PurgeCSS().purge({
    css: ["css/bulma.min.css"],
    content: ["index.html", "js/main.js"],
    // Safelist rules purge can't infer from a text scan of generated markup:
    //  - standard is-active: toggled by JS as a string fragment
    //    (className += " is-active") and is the modal's visible state.
    //  - greedy /table/: our tables are built as HTML strings, and Bulma's
    //    striping rule targets `.table.is-striped tbody tr...`. The browser
    //    injects <tbody> at runtime, so it never appears in the source text and
    //    purge would strip the zebra striping. Keeping every `table` selector is
    //    the robust fix for that implicit-element blind spot.
    safelist: {
        standard: ["is-active"],
        greedy: [/table/],
    },
});

await Bun.write("css/app.css", result[0].css);
console.log(
    `purge-css: css/bulma.min.css -> css/app.css (${result[0].css.length} bytes)`
);
