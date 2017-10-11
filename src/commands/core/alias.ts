import { Store } from '../../store/store';
import { Command } from '../command';

export function AliasCommand(store: Store): Command {
    return {
        desc: "Add or remove an alias",
        example: "alias hn https://news.ycombinator.com<br>alias foo http://{0}.{1}.com<br>",
        usage: "alias name target [target if no args]",
        gen: function (q: string, args: any[]) {
            var cmdName = args[0].toLowerCase();
            if (cmdName) {
                const aliases = store.get();
                if (args.length == 1) {
                    delete aliases[cmdName];
                } else {
                    aliases[cmdName] = {
                        target: args[1].match(/^[a-zA-Z_\-$]+$/) ? args[1] : undefined, // points to another command
                        url: args[1].match(/^[a-zA-Z_\-$]+$/) ? undefined : args[1],
                        urlNoArgs: args[2],
                        desc: "redirects: <i>" + args[1] + "</i>" + (args[2] === undefined ? "" : "<br>Without args: <i>" + args[2] + "</i>"),
                        gen: () => ({})
                    };
                }
                store.set(aliases)
            }
            return {
                text: "Invalid usage",
            };
        }
    }
}