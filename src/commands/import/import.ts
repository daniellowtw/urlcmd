import { Command, CommandResult, format, redirect } from '../command';
import { Store } from '../../../src/store/store';

export function ImportCommand(store: Store): Command {
    return {
        "desc": "Import commands/aliases from a url",
        "example": "import bar foo.js",
        gen: (q: string, args: string[]): CommandResult => {
            if (args.length != 2) {
                return {
                    "text": "Usage: import bar foo.js"
                }
            }
            var name = args[0];
            var url = args[1];
            importFromURL(name, url).then((cmd: Command) => {
                const aliases = store.get();
                aliases[name] = cmd;
                store.set(aliases)
            }).catch(console.log)
            return {
                "text": "Imported as " + name
            }
        }
    }
}

// this is the functions the external methods can have
interface ExtensionUtils {
}

interface Extension {
    (name: string, utils: ExtensionUtils): Command
}

const utils: ExtensionUtils = {
    format: format,
    redirect: redirect,
}

// TODO: Consider removing this feature altogether
function importFromURL(name: string, url: string) {
    return fetch(url).then((resp) => {
        return resp.text()
    }).then(data => {
        try {
            var x = (new Function("return " + data))();
        } catch (err) {
            return {
                "text": "bad imported code" + err
            }
        }
        const y = x(name, utils) as Command
        y.genSrc = true;
        y.genString = y.gen.toString()
        return y
    })
}
