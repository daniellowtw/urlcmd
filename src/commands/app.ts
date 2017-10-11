import { LocalStorageStore, Store } from '../store/store';
import { splitArgs, navigate } from '../browser/browser';
import { Command, CommandResult, format, CommandForPrinting } from './command';
import { FrontEnd, NoopUI } from '../ui/ui';
import { coreCommands, CommandMap } from './core/core';
import { parseArgs } from './parser';
import { baseCommands } from './base/base';

interface LoadedCommand {
    list?(): CommandForPrinting[]
    gen(query: string): any
}

interface ListStyle {
    color: string
}

export class App {
    store: Store;
    loaders: LoadedCommand[] = [];
    loaderCalls: number;
    // lazy load
    frontend: FrontEnd;
    constructor() {
        this.store = new LocalStorageStore();
        this.frontend = new NoopUI();
        this.loadFromStore();
    }

    loadFromStore() {
        this.loaders = [];
        this.loaders.push(this.AliasLoader(),
            this.CommandSetLoader(coreCommands(this.store), {
                color: "navy"
            }),
            this.CommandSetLoader(baseCommands))
    }

    setFrontEnd(ui: FrontEnd) {
        this.frontend = ui;
        this.frontend.listAllCommands(this.listAll());
    }

    importStuff(obj: CommandMap) {
        if (!obj) return
        this.store.set(obj)
    }

    executeCmd(location: Location) {
        this.loaderCalls = 0;
        // this.frontend.displayContent(""); // clear content
        const searchQuery = splitArgs(location).q;
        if (searchQuery) {
            document.title = searchQuery;
            const r = this.applyLoader(searchQuery);
            if (r) {
                if (r.url) {
                    navigate(r.url);
                } else if (r.text) {
                    this.frontend.displayContent(r.text);
                }
            }
        }
        // this.frontend.listAllCommands(this.listAll())
    }

    // try and use all the given loaders on the query text.
    applyLoader(text: string): CommandResult {
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
        return { text: "No loaders can handle the query" }
    }

    AliasLoader(): LoadedCommand {
        return this.CommandSetLoader(this.store.get(), {
            color: "red"
        });
    }

    CommandSetLoader(commandSet: CommandMap, opts?: ListStyle): LoadedCommand {
        return {
            gen: (query: string) => {
                const components = query.split(" ");
                var commandName = components[0].toLowerCase();
                var args = query.substring(components[0].length + 1);
                var params = parseArgs(args);
                var command = commandSet[commandName];
                if (!command) {
                    return false;
                }
                if (command.target) {
                    return this.applyLoader(
                        command.target + " " + args
                    );
                }
                if ((!args || !command.url) && command.urlNoArgs) {
                    return {
                        url: command.urlNoArgs
                    };
                } else if (command.url) {
                    return {
                        url: format(command.url, params, true)
                    };
                } else if (command.genSrc) {
                    try {
                        var x = (new Function("return " + command.genString))();
                    } catch (err) {
                        return {
                            "text": "bad imported code" + err
                        }
                    }
                    return x.apply(null, params);
                } else if (command.gen) {
                    return command.gen(args, params);
                }
                return false;
            },
            list: () => {
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
    }

    listAll(): CommandForPrinting[] {
        this.loadFromStore(); // make sure we get an updated version
        var result: CommandForPrinting[] = [];
        var seen: { [key: string]: boolean } = {};
        // hacks to make sure we load latest aliases
        this.loaders.unshift(this.AliasLoader())
        this.loaders.forEach((loader, i) => {
            if (!loader.list) return
            const l = loader.list()
            l.forEach(x => {
                if (!seen[x.name]) {
                    result.push(x)
                    seen[x.name] = true
                }
            })
        });
        return result;
    }
}