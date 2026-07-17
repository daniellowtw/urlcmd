// Ambient globals provided by other scripts / the browser environment.
// `declare` statements are types only and emit no JavaScript, so the compiled
// output stays a plain classic script that index.html can load directly.
declare const System: { import(url: string): Promise<any> };
declare function completely(el: HTMLElement | null): any;

import { parseArgs } from "./parseArgs";

// Legacy shared global. Several commands assign to `aliases` without declaring
// it; that worked in the old sloppy-mode script but throws under the "use
// strict" that the compiler emits, so declare it for real (emits `var aliases`).
var aliases: { [name: string]: any };

var ALIASES_KEY = "sb";

/*
    A command has the following properties

    desc - A short description
    usage - a short text to describe how to use the command
    example - using it in action
    gen - execute the function
*/



var utils = {
    format: function() {
        var newArguments = [].slice.call(arguments, 1)
        var args = newArguments;
        var s = arguments[0]
        return s.replace(/{(\d+)}/g, (match, number) => {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    },
    redirect: function(url) {
        window.location.assign(url);
    }
}

var baseCommands = {
    "notepad" : {
        desc: "create a scratch pad",
        usage: "notepad",
        gen: function() {
            // Chrome blocks top-frame navigation to data: URLs, so serve the
            // same HTML from a blob URL, which is allowed.
            var blob = new Blob(["<html contenteditable><title>Notepad</title>"], { type: "text/html" });
            return {
                url: URL.createObjectURL(blob)
            };
        }
    }
};

var coreCommands = {
    "help": {
        desc: "List available commands",
        gen: function(_unused) {
            listAll();
            return true;
        }
    },
    "debug": {
        desc: "Print out the resolved result for a query",
        example: "debug tr en:fr hello",
        gen: function(q) {
            return {
                text: "<pre>" + JSON.stringify(applyLoader(q), null, 2) + "</pre>"
            };
        }
    },
    "hist": {
        desc: "Show recent command history",
        gen: function() {
            var hist = getHistory();
            if (!hist.length) {
                return { text: "No history yet" };
            }
            return { text: "<pre>" + hist.join("\n") + "</pre>" };
        }
    },
    "alias": {
        desc: "Add or remove an alias",
        example: "alias hn https://news.ycombinator.com<br>alias foo http://{0}.{1}.com<br>",
        usage: "alias name target [target if no args]",

        gen: function(q, args) {
            var cmdName = args[0].toLowerCase();
            if (cmdName) {
                aliases = getAliases();
                if (args.length == 1) {
                    delete aliases[cmdName];
                } else {
                    aliases[cmdName] = {
                        target: args[1].match(/^[a-zA-Z_\-$]+$/) ? args[1] : undefined, // points to another command
                        url: args[1].match(/^[a-zA-Z_\-$]+$/) ? undefined : args[1],
                        urlNoArgs: args[2],
                        desc: "redirects: <i>" + args[1] +  "</i>" + (args[2] === undefined ? "" : "<br>Without args: <i>" + args[2] + "</i>"), 
                    };
                }
                setAliases(aliases)
            }
            return {
                text: "Invalid usage",
            };
        }
    },
    "rm": {
        desc: "Remove aliases",
        example: "Usage: rm cmd1 cmd2 cmd3<br>",
        gen: function(q, args) {
            aliases = getAliases();
            args.forEach(x=> delete aliases[x]);
            setAliases(aliases);
            return {
                text: "Usage: rm cmd1 cmd2 cmd3<br>"
            };
        }
    },
    "mv": {
        desc: "Rename an alias",
        usage: "mv oldname newname",
        example: "mv hn news<br>",
        gen: function(q, args) {
            if (args.length != 2) {
                return { text: "Usage: mv oldname newname" };
            }
            var from = args[0];
            var to = args[1];
            if (from === to) {
                return { text: "Nothing to do: names are the same" };
            }
            aliases = getAliases();
            if (!aliases[from]) {
                return { text: "No such alias: " + from };
            }
            aliases[to] = aliases[from];
            delete aliases[from];
            setAliases(aliases);
            return { text: "Renamed " + from + " to " + to };
        }
    },
    "import": {
        "desc": "Import a single command from a url",
        "example": "import bar foo.js",
        gen: function(q, args) {
            if (args.length != 2) {
                return {
                    "text": "Usage: import name url"
                }
            }

            var name = args[0];
            var url = args[1];
            loadModule(name, url).then(mod => {
                if (mod.bundle) {
                    displayContent(url + " is a bundle. Use: import-all " + url);
                    return;
                }
                aliases = getAliases();
                aliases[name] = finalizeCommand(mod);
                setAliases(aliases);
                listAll();
                displayContent("Imported as " + name);
            }).catch(console.log)

            return {
                "text": "Importing " + name + "…"
            }
        }
    },
    "import-all": {
        "desc": "Import every command from a bundle url",
        "example": "import-all x/timestamp.js",
        gen: function(q, args) {
            if (args.length != 1) {
                return {
                    "text": "Usage: import-all url"
                }
            }

            var url = args[0];
            loadModule("import-all", url).then(mod => {
                if (!mod.bundle) {
                    displayContent(url + " is not a bundle. Use: import name " + url);
                    return;
                }
                // A bundle names further modules to import; pull them all,
                // then persist in one write to avoid clobbering.
                var names = Object.keys(mod.bundle);
                return Promise.all(names.map(n =>
                    loadModule(n, mod.bundle[n]).then(cmd => [n, finalizeCommand(cmd)])
                )).then(pairs => {
                    aliases = getAliases();
                    pairs.forEach(p => { aliases[p[0]] = p[1]; });
                    setAliases(aliases);
                    listAll();
                    displayContent("Imported: " + names.join(", "));
                });
            }).catch(console.log)

            return {
                "text": "Importing bundle…"
            }
        }
    },
    "export": {
        "desc": "Output the current aliases for sharing",
        "usage": "export",
        "gen": function(q, args) {
            return {
                "text": "<textarea class='textarea config-textarea' placeholder='Config string' rows=20>"+localStorage.getItem(ALIASES_KEY)+"</textarea>"
            }
        }
    }
};

// loadModule fetches an example module and instantiates it under the given
// name. The result is either a single command object (has `gen`) or a bundle
// (`{ bundle: { name: url, ... } }`) that names further modules to import.
function loadModule(name, url) {
    return System.import(url).then(m => m(name, utils));
}

// finalizeCommand serializes an imported command's `gen` so it can be persisted
// to localStorage and re-evaluated later (see the genSrc branch in the loader).
function finalizeCommand(cmd) {
    cmd.genString = cmd.gen.toString();
    cmd.genSrc = true;
    return cmd;
}

function setAliases(aliases) {
    localStorage.setItem(ALIASES_KEY, JSON.stringify(aliases));
}

function getAliases() {
    try {
        return JSON.parse(localStorage.getItem(ALIASES_KEY)) || {};
    } catch (ex) {
        return {};
    }
}

var HISTORY_KEY = "urlcmd_history";

function getHistory(): string[] {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (ex) {
        return [];
    }
}

function setHistory(value) {
    if (!value) {
        return;
    }
    var hist = getHistory();
    hist.unshift(value);
    if (hist.length > 15) {
        hist = hist.slice(0, 15);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}


// CommandSetLoader tries to execute the command in the command set that corresponds to the name
function CommandSetLoader(commandSet, opts?) {
    return {
        gen: function(q) {
            var components = q.split(" ");
            var cmd = components[0].toLowerCase();
            var args = q.substring(components[0].length + 1);
            var params = parseArgs(args);
            var r = commandSet[cmd];
            if (r && r.target) {
                return applyLoader(
                    r.target + " " + args
                );
            }

            if (!r) {
                return false;
            }
            if ((!args || !r.url) && r.urlNoArgs) {
                return {
                    url: r.urlNoArgs
                };
            } else if (r.url) {
                params.unshift(r.url)
                return {
                    url: utils.format.apply(null, params)
                };
            } else if (r.genSrc) {
                try {
                    var x = (new Function("return " + r.genString))();
                } catch (err) {
                    return {
                        "text": "bad imported code" + err
                    }
                }
                return x.apply(null, params);
            } else if (r.gen) {
                return r.gen(args, params);
            }
            return false;
        },
        list: function() {
            var result = [];
            for (var key in commandSet) {
                result.push({
                    cmd: key,
                    cmdObject: commandSet[key],
                    style: (opts || {}).listStyle,
                });
            }
            return result;
        }
    };
}

function AliasLoader() {
    return CommandSetLoader(getAliases(), {
        listStyle: "color: red;"
    });
}

function FallbackLoader(r) {
    return {
        gen: function(q) {
            if (/%s/.test(r.url)) {
                return {
                    url: r.url.replace("%s", encodeURIComponent(q))
                }
            }
            listAll();
            return true;
        }
    };
}


var loaders = [
    AliasLoader(),
    CommandSetLoader(coreCommands, {
        listStyle: "color: navy;"
    }),
    CommandSetLoader(baseCommands),
    FallbackLoader(coreCommands["help"])
];

var loaderCalls = 0;

// try and use all the given loaders on the query text.
function applyLoader(text) {
    loaderCalls += 1;
    if (loaderCalls > 10) {
        return {
            text: "Invalid alias chain"
        };
    }
    for (var i = 0; i < loaders.length; i++) {
        var r = loaders[i].gen(text);
        if (r) {
            return r;
        }
    }
}

// navigate redirects the browser to the given url
function navigate(url) {
    window.location.assign(url);
}

// splitArgs parses the query from the url. It converts ?q=foo%20bar%20car into {"q":"foo bar car"}
function splitArgs(loc): { [key: string]: string } {
    var hash = loc.hash.substr(1);
    hash = decodeURIComponent(hash)
    if (hash !== "") {
        return {q:hash}
    }
    var s = decodeURIComponent(loc.search)
    var result: { [key: string]: string } = {};
    var pairs = s.split(/[&?]/);
    for (var i = 0; i < pairs.length; i++) {
        if (!pairs[i]) {
            continue;
        }
        var groups = /([^=]*)(=(.*$))?/.exec(pairs[i]);
        result[groups[1]] = decodeURIComponent(groups[3].replace(/\+/g, '%20'));
    }
    return result;
}


function listAll() {
    var result = [];
    var seen = {};
    // hacks to make sure we load latest aliases
    loaders[0] = AliasLoader()
    for (var i = 0; i < loaders.length; i++) {
        if (!loaders[i].list) {
            continue;
        }
        var l = (loaders[i].list || function() {
            return [];
        })();
        for (var j = 0; j < l.length; j++) {
            if (!seen[l[j].cmd]) {
                result.push(l[j]);
                seen[l[j].cmd] = true;
            }
        }
    };

    // If updating fails because dom is not loaded, then wait for it to load.
    try {
        document.getElementById('list-all-content').innerHTML = displayEntries(result);
    } catch (e) {
        document.addEventListener("DOMContentLoaded", function(event) {
            document.getElementById('list-all-content').innerHTML = displayEntries(result);
        });
    }
}

// Writes the given content into the correct div. Non-empty output is wrapped in
// a Bulma box so a command's response reads as a distinct card, set apart from
// the always-on command list below it. Empty content clears the div (no box).
function displayContent(content) {
    var html = content ? '<div class="box">' + content + '</div>' : '';
    // If updating fails because dom is not loaded, then wait for it to load.
    try {
        document.getElementById('content').innerHTML = html;
    } catch (e) {
        document.addEventListener("DOMContentLoaded", function(event) {
            document.getElementById('content').innerHTML = html;
        });
    }
}

// Entry point, bootstrap and check if requirements are met.
if (supports_html5_storage()) {
    executeCmd();
    document.addEventListener("DOMContentLoaded", function(event) {
        setUpHelp();
        setUpLoad();
        setUpReset();
        setUpExt();
        setUpAutoComplete();
    });

} else {
    document.write("This app requires Localstorage but it is not supported by your browser. Please use a newer browser.")
}

// supports_html5_storage checks if the user agent supports localStorage.
function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}


/* UI STUFF */

// setUpHelp bootstraps the help mechanism.
function setUpHelp() {
    var helpEl = document.getElementById('help')
    var currentClass = helpEl.className
    document.getElementById('helpOpen').onclick = () => {
        helpEl.className += " is-active";
    }
    (helpEl.lastElementChild as HTMLElement).onclick = () => {
        helpEl.className = currentClass;
    }
}

// setUpLoad bootstraps the load mechanism.
function setUpLoad() {
    function importStuff() {
        var x = (document.getElementById('importContent') as HTMLTextAreaElement).value;
        try {
            var res = JSON.parse(x)
            localStorage.setItem(ALIASES_KEY, x);
            loadEl.className = currentClass;
            displayContent("loaded")
            listAll()
        } catch (err) {
            alert("loading: " + err)
        }
    }

    var loadEl = document.getElementById('load')
    var currentClass = loadEl.className
    document.getElementById('loadOpen').onclick = () => {
            loadEl.className += " is-active";
        }
        // add handler for cancel button
    document.getElementById('submitLoadBtn').onclick = importStuff
        // add handler for cancel button
    document.getElementById('cancelLoadBtn').onclick = () => {
            loadEl.className = currentClass;
        }
        // add handler for top right cross
    (loadEl.lastElementChild as HTMLElement).onclick = () => {
        loadEl.className = currentClass;
    }
}

// setUpReset wires the reset button to clear all saved aliases after a confirm.
function setUpReset() {
    document.getElementById('resetBtn').onclick = () => {
        if (confirm("Reset config? This removes all your saved aliases.")) {
            localStorage.removeItem(ALIASES_KEY);
            displayContent("reset");
            listAll();
        }
    };
}

// setUpExt wires the Extensions button: it opens the modal and (re)renders the
// list of available x/ extensions from the manifest.
function setUpExt() {
    var extEl = document.getElementById('ext');
    var currentClass = extEl.className;
    document.getElementById('extOpen').onclick = () => {
        extEl.className += " is-active";
        renderExtensions();
    };
    (extEl.lastElementChild as HTMLElement).onclick = () => {
        extEl.className = currentClass;
    };
}

// loadExtensionItems reads the manifest (x/index.json) and resolves each entry
// to an item: either a single command { kind:"single", name, url, desc } using
// the module's self-declared `cmd` name, or a bundle
// { kind:"bundle", label, members:[{name,url,desc}] } that keeps its commands
// grouped so the UI can show them under one heading.
function loadExtensionItems(): Promise<any[]> {
    return fetch("x/index.json").then(r => r.json()).then(files => {
        return Promise.all(files.map(url =>
            loadModule("", url).then((mod): any => {
                if (mod.bundle) {
                    var names = Object.keys(mod.bundle);
                    return Promise.all(names.map(n =>
                        loadModule(n, mod.bundle[n]).then(cmd => ({ name: n, url: mod.bundle[n], desc: cmd.desc }))
                    )).then(members => ({ kind: "bundle", label: bundleLabel(url), members: members }));
                }
                return { kind: "single", name: mod.cmd || "", url: url, desc: mod.desc };
            })
        ));
    });
}

// bundleLabel derives a display name from a module url, e.g. x/timestamp.js -> timestamp.
function bundleLabel(url) {
    return url.replace(/^.*\//, "").replace(/\.js$/, "");
}

// importExtension imports a single command (the module at `url`) under `name`.
function importExtension(name, url) {
    return loadModule(name, url).then(mod => {
        aliases = getAliases();
        aliases[name] = finalizeCommand(mod);
        setAliases(aliases);
        listAll();
    });
}

// cmdRow renders one importable command row; `indent` nests bundle members.
function cmdRow(name, url, desc, indent) {
    var pad = indent ? ' style="padding-left:1.5em"' : '';
    return '<tr><td' + pad + '><tt>' + name + '</tt></td><td>' + (desc || "")
        + '</td><td><button class="button is-small ext-import" data-name="'
        + name + '" data-url="' + url + '">Import</button></td></tr>';
}

// renderExtensions populates the Extensions modal from the current manifest.
function renderExtensions() {
    var el = document.getElementById('ext-content');
    el.innerHTML = "Loading…";
    loadExtensionItems().then((items: any[]) => {
        var html = '<p><button class="button is-primary is-small" id="extImportAll">Import all</button></p>';
        html += '<table class="table is-fullwidth">';
        items.forEach((item, i) => {
            if (item.kind === "bundle") {
                html += '<tr><td><tt>' + item.label + '</tt></td>'
                    + '<td><em>bundle · ' + item.members.length + ' commands</em></td>'
                    + '<td><button class="button is-small ext-import-bundle" data-i="' + i
                    + '">Import all ' + item.members.length + '</button></td></tr>';
                item.members.forEach(m => { html += cmdRow(m.name, m.url, m.desc, true); });
            } else {
                html += cmdRow(item.name, item.url, item.desc, false);
            }
        });
        html += '</table>';
        el.innerHTML = html;

        // A single command import (used by both single rows and bundle members).
        Array.prototype.forEach.call(el.querySelectorAll('.ext-import'), (btn: any) => {
            btn.onclick = () => {
                importExtension(btn.getAttribute('data-name'), btn.getAttribute('data-url'))
                    .then(() => { btn.textContent = "Imported ✓"; });
            };
        });
        // Import every command in one bundle.
        Array.prototype.forEach.call(el.querySelectorAll('.ext-import-bundle'), (btn: any) => {
            btn.onclick = () => {
                var members = items[btn.getAttribute('data-i')].members;
                Promise.all(members.map(m => importExtension(m.name, m.url)))
                    .then(() => { btn.textContent = "Imported ✓"; });
            };
        });
        // Import everything (all singles + all bundle members).
        document.getElementById('extImportAll').onclick = () => {
            var all = [];
            items.forEach(item => {
                if (item.kind === "bundle") { all = all.concat(item.members); }
                else { all.push(item); }
            });
            Promise.all(all.map(r => importExtension(r.name, r.url))).then(renderExtensions);
        };
    }).catch(e => { el.innerHTML = "Failed to load extensions: " + e; });
}

// displayEntries takes a result and returns a html string for representing the result in a table
function displayEntries(result, opts?) {
    var opts = opts || {};
    if (opts.withSort) {

        result.sort(function(a, b) {
            if (a.cmd < b.cmd) {
                return -1;
            } else if (a.cmd > b.cmd) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    var res = ""
    res += "<h2>Available commands</h2>";
    res += '<table class="table is-bordered is-striped is-narrow">';

    for (var i = 0; i < result.length; i++) {
        var styleDesc = result[i].style ? 'style="' + result[i].style + '"' : "";
        res += "<tr><td " + styleDesc + ">" + result[i].cmd + "&nbsp;</td>";
        var cmdObject = result[i].cmdObject;
        if (cmdObject.target) {
            res += "<td><i>" + cmdObject.target + "</i></td>";
        } else {
            res += "<td>" + (cmdObject.desc || "") + (cmdObject.example ? "<br>" + cmdObject.example : "") + "</td>";
        }
        res += "</tr>\n";
    }

    res += "</table><br/>";
    res += "General usage is: <tt>cmd [query]</tt>";
    return res
}


function doQuery(text) {
    var query = text;
    if (query === "") {
        var el = document.getElementById("query-text") as HTMLInputElement;
        query = el.value;
        el.value = "";
    }
    setHistory(query);
    window.location.href='index.html#' + query; // Will not trigger refresh
    executeCmd();
}

function executeCmd() {
    displayContent(""); // clear content
    var searchQuery = splitArgs(window.location).q;
    if (searchQuery) {
        document.title = searchQuery;
        var r = applyLoader(searchQuery);
        if (r) {
            if (r.url) {
                navigate(r.url);
            } else if (r.text) {
                displayContent(r.text);
            }
        }
        listAll()
    } else {
        listAll()
    }
}

function makeList(obj) {
    var x = [];
    for (var key in obj) {
        var temp = obj[key]; // maybe clone
        temp.name = key;
        x.push(temp);
    }
    for (var i in baseCommands) {
        var temp = baseCommands[i]; // maybe clone
        temp.name = i;
        x.push(temp);

    }
    for (var i in coreCommands) {
        var temp = coreCommands[i]; // maybe clone
        temp.name = i;
        x.push(temp);
    }

    return x;
}

function doSearch(text) {
    // TODO: cache this so we don't always update
    var list = makeList(getAliases());
    var res = [];
    list.forEach(x => {
        res.push({"name":x["name"], "usage": x["usage"]||undefined})
    })
    return res;
}

function setUpAutoComplete() {
   var pv = completely(document.getElementById('container-search'));
   pv.options = [];
   pv.repaint();

    // Shell-style history recall. histIndex == -1 means "not navigating"
    // (the live input); 0 is the most recent command. histNavValue is the
    // exact text we last injected, so onChange can tell our own injection
    // apart from the user typing a real character.
    var histIndex = -1;
    var histNavValue = null;

    pv.onArrowUp = function () {
        var hist = getHistory();
        if (!hist.length) { return; }
        histIndex = Math.min(histIndex + 1, hist.length - 1);
        histNavValue = hist[histIndex];
        pv.setText(histNavValue);
    };

    pv.onArrowDown = function () {
        if (histIndex <= 0) {
            // Stepped past the newest entry: back to an empty live input.
            histIndex = -1;
            histNavValue = "";
            pv.setText("");
            return;
        }
        var hist = getHistory();
        histIndex -= 1;
        histNavValue = hist[histIndex];
        pv.setText(histNavValue);
    };

    pv.onChange = function (text) {
        if (text === histNavValue) {
            // We injected this while walking history; keep the dropdown empty
            // so a further Up/Down keeps walking history instead of navigating
            // a freshly-populated suggestion list.
            pv.options = [];
            pv.repaint();
            return;
        }
        histIndex = -1; // user edited the text: leave history navigation.
        if (text.length == 0) {
            pv.options = [];
            pv.repaint();
            return;
        }
        var oj = doSearch(text);
        pv.options =[];
        for (var i in oj) { pv.options.push(oj[i].usage || oj[i].name); }
        pv.repaint();
        pv.input.focus();
    };

    // Hacks to fix stying of the generated elements
    pv.input.className="input"
    pv.input.placeholder="Command. Try 'help'"
    pv.hint.className="input"
    pv.prompt.className="input"
    pv.wrapper.className="control has-addons"

    // Trigger search when user enters
    pv.onEnter = function(){
        doQuery(pv.input.value);
        pv.setText('');
        histIndex = -1;
        histNavValue = "";
    }

   setTimeout(function() {
    pv.input.focus();
   },0);
}