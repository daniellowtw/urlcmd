
/*
    A command has the following properties

    desc - A short description
    usage - a short text to describe how to use the command
    example - using it in action
    gen - execute the function
*/
import { listAll } from "./loader";
import { getAliases, setAliases } from "./store";

export type CommandSet = {[k: string]: Command}

export interface Command {
    target?: string; // Redirect to another command
    url?: string; // simple redirect too
    urlNoArgs?: string;

    cmd?: string;
    desc: string| string[];
    usage?: string;
    example?: string| string[];
    gen: (query: string, args: string[]) => CommandResult;
}

export interface CommandResult {
    text?: string;
    url?: string;
}

export const baseCommands: {[k: string]: Command} = {
    "msecs": {
        desc: "Unix timestamp conversion (milliseconds)",
        gen: function(q) {
            if (!q) {
                return {
                    text: "" + Math.floor(new Date().getTime())
                };
            } else {
                return {
                    text: "" + new Date(parseInt(q, 10))
                }
            }
        }
    },
    "secs": {
        desc: "Unix timestamp conversion",
        gen: function(q) {
            if (!q) {
                return {
                    text: "" + Math.floor(new Date().getTime() / 1000)
                };
            } else {
                return {
                    text: "" + new Date(parseInt(q, 10) * 1000)
                }
            }
        }
    },
    "tr": {
        desc: "Google Translate",
        usage: "tr [[from]:[to]] text",
        example: "Example: tr ro:fr buna ziua",
        gen: function(q) {
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
    },
};

export const coreCommands: CommandSet = {
    "home": {
        desc: "Show this page",
        gen: () => ({url: "index.html"})
    },
    "help": {
        desc: "List available commands",
        gen: function() {
            listAll();
            return {}
        }
    },
    "alias": {
        desc: "Add or remove an alias",
        example: ["alias hn https://news.ycombinator.com", "alias foo http://{0}.{1}.com"],
        usage: "alias name target [target if no args]",

        gen: function(q, args) {
            var cmdName = args[0].toLowerCase();
            if (cmdName) {
                const aliases = getAliases();
                if (args.length == 1) {
                    delete aliases[cmdName];
                } else {
                    aliases[cmdName] = {
                        target: args[1].match(/^[a-zA-Z_\-$]+$/) ? args[1] : undefined, // points to another command
                        url: args[1].match(/^[a-zA-Z_\-$]+$/) ? undefined : args[1],
                        urlNoArgs: args[2],
                        desc: [`redirects: ${args[1]}`, `${(args[2] === undefined ? "" : "\nWithout args: " + args[2])}`], 
                        gen: function(a, b){return {}}
                    };
                }
                setAliases(aliases)
                return {}
            }
            return {
                text: "Invalid usage",
            };
        }
    },
    "rm": {
        desc: "Remove aliases",
        example: "Usage: rm cmd1 cmd2 cmd3",
        gen: function(q, args) {
            const aliases = getAliases();
            args.forEach(x=> delete aliases[x]);
            setAliases(aliases);
            return {
                text: "Usage: rm cmd1 cmd2 cmd3"
            };
        }
    },
    "export": {
        "desc": "Output the current aliases for sharing",
        "usage": "export",
        gen: function(q, args) {
            return {
                "text": JSON.stringify(getAliases())
            }
        }
    }
};


export function makeList(obj) {
    var x = [];
    for (var key in obj) {
        var temp = obj[key]; // maybe clone
        temp.name = key;
        x.push(temp);
    }
    for (var i in baseCommands) {
        const temp = Object.create(baseCommands[i]); // maybe clone
        temp.name = i;
        x.push(temp);

    }
    for (var i in coreCommands) {
        const temp = Object.create(coreCommands[i]); // maybe clone
        temp.name = i;
        x.push(temp);
    }

    return x;
}