/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/js/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Takes a template and a list of values and replaces {0}, {1}, ... with the values from the list.
 *
 * @export
 * @param {string} template
 * @param {string[]} args
 * @param {boolean} [urlEncode=false]
 * @returns {string}
 */
function format(template, args, urlEncode) {
    if (urlEncode === void 0) { urlEncode = false; }
    return template.replace(/{(\d+)}/g, function (match, number) {
        if (typeof args[number] === 'undefined') {
            return "";
        }
        if (urlEncode) {
            return encodeURIComponent(args[number]);
        }
        return args[number];
    });
}
exports.format = format;
function redirect(url) {
    window.location.assign(url);
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        if (tabs.length === 0 || !tabs[0].id) {
            return;
        }
        chrome.tabs.update(tabs[0].id, {
            url: url
        });
    });
}
exports.redirect = redirect;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var NoopUI = /** @class */ (function () {
    function NoopUI() {
    }
    NoopUI.prototype.displayContent = function () { };
    NoopUI.prototype.listAllCommands = function (result) { };
    return NoopUI;
}());
exports.NoopUI = NoopUI;
var windowUI = /** @class */ (function () {
    function windowUI(app) {
        var _this = this;
        document.addEventListener("DOMContentLoaded", function (event) {
            _this.setUpHelp();
            _this.setUpLoad(app);
            _this.setUpAutoComplete(app);
            app.setFrontEnd(_this);
            // since we have a UI now and it was clearly not a redirect, execute the command again.
            // TODO: Make this reuse the result instead of recomputing.
            app.executeCmd(window.location);
        });
    }
    // Writes the given content into the correct div
    windowUI.prototype.displayContent = function (content) {
        // If updating fails because dom is not loaded, then wait for it to load.
        try {
            document.getElementById('content').innerHTML = content;
        }
        catch (e) {
            document.addEventListener("DOMContentLoaded", function (event) {
                document.getElementById('content').innerHTML = content;
            });
        }
    };
    windowUI.prototype.listAllCommands = function (result) {
        var _this = this;
        // If updating fails because dom is not loaded, then wait for it to load.
        try {
            document.getElementById('list-all-content').innerHTML = this.displayEntries(result);
        }
        catch (e) {
            document.addEventListener("DOMContentLoaded", function (event) {
                document.getElementById('list-all-content').innerHTML = _this.displayEntries(result);
            });
        }
    };
    /* UI STUFF */
    // setUpHelp bootstraps the help mechanism.
    windowUI.prototype.setUpHelp = function () {
        var helpEl = document.getElementById('help');
        if (!helpEl)
            return;
        var currentClass = helpEl.className;
        document.getElementById('helpOpen').onclick = function () {
            helpEl.className += " is-active";
        };
        var closeButton = helpEl.lastElementChild;
        closeButton.onclick = function () {
            helpEl.className = currentClass;
        };
    };
    // setUpLoad bootstraps the load mechanism.
    windowUI.prototype.setUpLoad = function (app) {
        var _this = this;
        var loadEl = document.getElementById('load');
        if (!loadEl)
            return;
        var currentClass = loadEl.className;
        var importStuff = function () {
            var x = document.getElementById('importContent').value;
            try {
                var res = JSON.parse(x);
                app.importStuff(res);
                loadEl.className = currentClass;
                _this.displayContent("loaded");
                _this.listAllCommands(app.listAll());
            }
            catch (err) {
                alert("loading: " + err);
            }
        };
        document.getElementById('loadOpen').onclick = function () {
            loadEl.className += " is-active";
        };
        // add handler for cancel button
        document.getElementById('submitLoadBtn').onclick = importStuff;
        // add handler for cancel button
        document.getElementById('cancelLoadBtn').onclick = function () {
            loadEl.className = currentClass;
        };
        // add handler for top right cross
        var closeButton = loadEl.lastElementChild;
        closeButton.onclick = function () {
            loadEl.className = currentClass;
        };
    };
    // displayEntries takes a result and returns a html string for representing the result in a table
    windowUI.prototype.displayEntries = function (result, opts) {
        var opts = opts || {};
        if (opts.withSort) {
            result.sort(function (a, b) {
                if (a.name < b.name) {
                    return -1;
                }
                else if (a.name > b.name) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
        }
        var res = "";
        res += "<h2>Available commands</h2>";
        res += '<table class="table is-bordered is-striped is-narrow">';
        for (var i = 0; i < result.length; i++) {
            var styleDesc = result[i].color ? 'style="color:' + result[i].color + ';"' : "";
            res += "<tr><td " + styleDesc + ">" + result[i].name + "&nbsp;</td>";
            var cmdObject = result[i].cmdObj;
            if (cmdObject.target) {
                res += "<td><i>" + cmdObject.target + "</i></td>";
            }
            else {
                res += "<td>" + (cmdObject.desc || "") + (cmdObject.example ? "<br>" + cmdObject.example : "") + "</td>";
            }
            res += "</tr>\n";
        }
        res += "</table><br/>";
        res += "General usage is: <tt>cmd [query]</tt>";
        return res;
    };
    windowUI.prototype.setUpAutoComplete = function (app) {
        var _this = this;
        var pv = completely(document.getElementById('container-search'));
        pv.options = [];
        pv.repaint();
        pv.onChange = function (text) {
            if (text.length == 0) {
                pv.options = [];
                pv.repaint();
                return;
            }
            var oj = _this.doSearch(text, app.listAll());
            pv.options = [];
            for (var i in oj) {
                pv.options.push(oj[i].usage || oj[i].name);
            }
            pv.repaint();
            pv.input.focus();
        };
        // Hacks to fix stying of the generated elements
        pv.input.className = "input";
        pv.input.placeholder = "Command. Try 'help'";
        pv.hint.className = "input";
        pv.prompt.className = "input";
        pv.wrapper.className = "control has-addons";
        // Trigger search when user enters
        pv.onEnter = function () {
            _this.doQuery(pv.input.value);
            app.executeCmd(window.location);
            pv.setText('');
        };
        setTimeout(function () {
            pv.input.focus();
        }, 0);
    };
    windowUI.prototype.doSearch = function (text, commands) {
        // TODO: cache this so we don't always update
        var res = [];
        commands.forEach(function (x) {
            res.push({ "name": x.cmdObj.desc, "usage": x.cmdObj.usage || undefined });
        });
        return res;
    };
    windowUI.prototype.doQuery = function (query) {
        if (query === "") {
            var el = document.getElementById("query-text");
            if (!el) {
                return;
            }
            query = el.value || "";
            el.value = "";
        }
        window.location.href = 'index.html#' + query; // Will not trigger refresh
    };
    return windowUI;
}());
exports.windowUI = windowUI;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = __webpack_require__(3);
var ui_1 = __webpack_require__(1);
// Bootstrap and check if requirements are met.
if (supports_html5_storage()) {
    var app = new app_1.App();
    // Execute command before window loads to save time
    app.executeCmd(window.location);
    var ui = new ui_1.windowUI(app);
}
else {
    document.write("This app requires Localstorage but it is not supported by your browser. Please use a newer browser.");
}
// supports_html5_storage checks if the user agent supports localStorage.
function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    }
    catch (e) {
        return false;
    }
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var store_1 = __webpack_require__(4);
var browser_1 = __webpack_require__(5);
var command_1 = __webpack_require__(0);
var ui_1 = __webpack_require__(1);
var core_1 = __webpack_require__(6);
var parser_1 = __webpack_require__(9);
var base_1 = __webpack_require__(10);
var App = /** @class */ (function () {
    function App() {
        this.loaders = [];
        this.store = new store_1.LocalStorageStore();
        this.frontend = new ui_1.NoopUI();
        this.loadFromStore();
    }
    App.prototype.loadFromStore = function () {
        this.loaders = [];
        this.loaders.push(this.AliasLoader(), this.CommandSetLoader(core_1.coreCommands(this.store), {
            color: "navy"
        }), this.CommandSetLoader(base_1.baseCommands));
    };
    App.prototype.setFrontEnd = function (ui) {
        this.frontend = ui;
        this.frontend.listAllCommands(this.listAll());
    };
    App.prototype.importStuff = function (obj) {
        if (!obj)
            return;
        this.store.set(obj);
    };
    App.prototype.executeCmd = function (location) {
        this.loaderCalls = 0;
        // this.frontend.displayContent(""); // clear content
        var searchQuery = browser_1.splitArgs(location).q;
        if (searchQuery) {
            document.title = searchQuery;
            var r = this.applyLoader(searchQuery);
            if (r) {
                if (r.url) {
                    browser_1.navigate(r.url);
                }
                else if (r.text) {
                    this.frontend.displayContent(r.text);
                }
            }
        }
        // this.frontend.listAllCommands(this.listAll())
    };
    // try and use all the given loaders on the query text.
    App.prototype.applyLoader = function (text) {
        this.loaderCalls += 1;
        if (this.loaderCalls > 10) {
            return { text: "Invalid alias chain" };
        }
        for (var i = 0; i < this.loaders.length; i++) {
            var r = this.loaders[i].gen(text);
            if (r) {
                return r;
            }
        }
        return { text: "No loaders can handle the query" };
    };
    App.prototype.AliasLoader = function () {
        return this.CommandSetLoader(this.store.get(), {
            color: "red"
        });
    };
    App.prototype.CommandSetLoader = function (commandSet, opts) {
        var _this = this;
        return {
            gen: function (query) {
                var components = query.split(" ");
                var commandName = components[0].toLowerCase();
                var args = query.substring(components[0].length + 1);
                var params = parser_1.parseArgs(args);
                var command = commandSet[commandName];
                if (!command) {
                    return false;
                }
                if (command.target) {
                    return _this.applyLoader(command.target + " " + args);
                }
                if ((!args || !command.url) && command.urlNoArgs) {
                    return {
                        url: command.urlNoArgs
                    };
                }
                else if (command.url) {
                    return {
                        url: command_1.format(command.url, params, true)
                    };
                }
                else if (command.genSrc) {
                    try {
                        var x = (new Function("return " + command.genString))();
                    }
                    catch (err) {
                        return {
                            "text": "bad imported code" + err
                        };
                    }
                    return x.apply(null, params);
                }
                else if (command.gen) {
                    return command.gen(args, params);
                }
                return false;
            },
            list: function () {
                var result = [];
                for (var key in commandSet) {
                    result.push({
                        name: key,
                        cmdObj: commandSet[key],
                        color: opts ? opts.color : "black",
                    });
                }
                return result;
            }
        };
    };
    App.prototype.listAll = function () {
        this.loadFromStore(); // make sure we get an updated version
        var result = [];
        var seen = {};
        // hacks to make sure we load latest aliases
        this.loaders.unshift(this.AliasLoader());
        this.loaders.forEach(function (loader, i) {
            if (!loader.list)
                return;
            var l = loader.list();
            l.forEach(function (x) {
                if (!seen[x.name]) {
                    result.push(x);
                    seen[x.name] = true;
                }
            });
        });
        return result;
    };
    return App;
}());
exports.App = App;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LocalStorageStore = /** @class */ (function () {
    function LocalStorageStore() {
        this.ALIASES_KEY = "sb";
    }
    LocalStorageStore.prototype.set = function (aliases) {
        localStorage.setItem(this.ALIASES_KEY, JSON.stringify(aliases));
    };
    LocalStorageStore.prototype.get = function () {
        var fromStore = localStorage.getItem(this.ALIASES_KEY);
        if (!fromStore)
            return {};
        return JSON.parse(fromStore);
    };
    return LocalStorageStore;
}());
exports.LocalStorageStore = LocalStorageStore;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// navigate redirects the browser to the given url
function navigate(url) {
    window.location.assign(url);
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        if (tabs.length === 0 || !tabs[0].id) {
            return;
        }
        chrome.tabs.update(tabs[0].id, {
            url: url
        });
    });
}
exports.navigate = navigate;
// splitArgs parses the query from the url. It converts ?q=foo%20bar%20car into {"q":"foo bar car"}
function splitArgs(loc) {
    var hash = loc.hash.substr(1);
    hash = decodeURIComponent(hash);
    if (hash !== "") {
        return { q: hash };
    }
    var s = decodeURIComponent(loc.search);
    var result = { q: "" };
    var pairs = s.split(/[&?]/);
    for (var i = 0; i < pairs.length; i++) {
        if (!pairs[i]) {
            continue;
        }
        var groups = /([^=]*)(=(.*$))?/.exec(pairs[i]);
        if (!groups) {
            break;
        }
        var key = groups[1];
        result[key] = decodeURIComponent(groups[3].replace(/\+/g, '%20'));
    }
    return result;
}
exports.splitArgs = splitArgs;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var alias_1 = __webpack_require__(7);
var import_1 = __webpack_require__(8);
var HelpCommand = {
    desc: "List available commands",
    gen: function () {
        return {
            text: "Should show list of command"
        };
    }
};
function RemoveCommand(store) {
    return {
        desc: "Remove aliases",
        example: "Usage: rm cmd1 cmd2 cmd3<br>",
        gen: function (q, args) {
            var aliases = store.get();
            args.forEach(function (x) { return delete aliases[x]; });
            store.set(aliases);
            return {
                text: "Usage: rm cmd1 cmd2 cmd3<br>"
            };
        }
    };
}
function MakeExportCommand(store) {
    return {
        desc: "Output the current aliases for sharing",
        usage: "export",
        gen: function (q, args) {
            return {
                "text": "<textarea class='textarea config-textarea' placeholder='Config string' rows=20>" + JSON.stringify(store.get()) + "</textarea>"
            };
        }
    };
}
function coreCommands(store) {
    return {
        "help": HelpCommand,
        "alias": alias_1.AliasCommand(store),
        "rm": RemoveCommand(store),
        "import": import_1.ImportCommand(store),
        "export": MakeExportCommand(store),
    };
}
exports.coreCommands = coreCommands;
;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function AliasCommand(store) {
    return {
        desc: "Add or remove an alias",
        example: "alias hn https://news.ycombinator.com<br>alias foo http://{0}.{1}.com<br>",
        usage: "alias name target [target if no args]",
        gen: function (q, args) {
            var cmdName = args[0].toLowerCase();
            if (cmdName) {
                var aliases = store.get();
                if (args.length == 1) {
                    delete aliases[cmdName];
                }
                else {
                    aliases[cmdName] = {
                        target: args[1].match(/^[a-zA-Z_\-$]+$/) ? args[1] : undefined,
                        url: args[1].match(/^[a-zA-Z_\-$]+$/) ? undefined : args[1],
                        urlNoArgs: args[2],
                        desc: "redirects: <i>" + args[1] + "</i>" + (args[2] === undefined ? "" : "<br>Without args: <i>" + args[2] + "</i>"),
                        gen: function () { return ({}); }
                    };
                }
                store.set(aliases);
            }
            return {
                text: "Invalid usage",
            };
        }
    };
}
exports.AliasCommand = AliasCommand;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var command_1 = __webpack_require__(0);
function ImportCommand(store) {
    return {
        "desc": "Import commands/aliases from a url",
        "example": "import bar foo.js",
        gen: function (q, args) {
            if (args.length != 2) {
                return {
                    "text": "Usage: import bar foo.js"
                };
            }
            var name = args[0];
            var url = args[1];
            importFromURL(name, url).then(function (cmd) {
                var aliases = store.get();
                aliases[name] = cmd;
                store.set(aliases);
            }).catch(console.log);
            return {
                "text": "Imported as " + name
            };
        }
    };
}
exports.ImportCommand = ImportCommand;
var utils = {
    format: command_1.format,
    redirect: command_1.redirect,
};
// TODO: Consider removing this feature altogether
function importFromURL(name, url) {
    return fetch(url).then(function (resp) {
        return resp.text();
    }).then(function (data) {
        try {
            var x = (new Function("return " + data))();
        }
        catch (err) {
            return {
                "text": "bad imported code" + err
            };
        }
        var y = x(name, utils);
        y.genSrc = true;
        y.genString = y.gen.toString();
        return y;
    });
}


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Takes the incoming string and parse it by semantic tokens.
 * A semantic token is a word separated by spaces, or words within double quotes.
 */
function parseArgs(s) {
    if (s.indexOf("\"") == -1) {
        return s.split(" ");
    }
    var spaceSeparatedList = s.split(" ");
    var res = [];
    var currWord = "";
    var currIndex = 0;
    do {
        currWord = spaceSeparatedList[currIndex];
        currIndex++;
        if (currWord[0] === '"') {
            currWord = currWord.substr(1);
            while ((currWord[currWord.length - 1] !== '"')
                && (currIndex < spaceSeparatedList.length)) {
                var temp = spaceSeparatedList[currIndex];
                currIndex++;
                if (temp === undefined) {
                    return spaceSeparatedList;
                }
                currWord += " " + temp;
            }
            currWord = currWord.substring(0, currWord.length - 1);
        }
        res.push(currWord);
    } while (currIndex < spaceSeparatedList.length);
    return res;
}
exports.parseArgs = parseArgs;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var timestamp_1 = __webpack_require__(11);
var translate_1 = __webpack_require__(12);
var notepad_1 = __webpack_require__(13);
exports.baseCommands = {
    "secs": timestamp_1.TimestampCommand,
    "tr": translate_1.TranslateCommand,
    "notepad": notepad_1.NotepadCommand,
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TimestampCommand = {
    desc: "Unix timestamp conversion",
    gen: function (q) {
        if (!q) {
            return {
                text: Math.floor(new Date().getTime() / 1000).toString()
            };
        }
        else {
            return {
                text: new Date(parseInt(q, 10) * 1000).toString()
            };
        }
    }
};


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslateCommand = {
    desc: "Google Translate",
    usage: "tr [[from]:[to]] text",
    example: "Example: tr ro:fr buna ziua",
    gen: function (q) {
        if (!q) {
            return {
                text: this.example
            };
        }
        var components = q.match(/^(([a-zA-Z\-]*):([a-zA-Z\-]*)\s+)?(.*$)/);
        var from = components[2] || 'auto';
        var to = components[3] || 'en';
        var text = components[4];
        return {
            url: "https://translate.google.com/#" + from + "/" + to + "/" + text
        };
    }
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.NotepadCommand = {
    desc: "create a scratch pad",
    usage: "notepad",
    gen: function () {
        return {
            url: "data:text/html,<html contenteditable>"
        };
    }
};


/***/ })
/******/ ]);