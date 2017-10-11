import { Command, CommandResult } from '../command';
import { Store } from '../../store/store';
import { AliasCommand } from './alias';
import { ImportCommand } from '../import/import';

const HelpCommand = {
    desc: "List available commands",
    gen: function () {
        return {
            text: "Should show list of command"
        };
    }
}

function RemoveCommand(store: Store) {
    return {
        desc: "Remove aliases",
        example: "Usage: rm cmd1 cmd2 cmd3<br>",
        gen: (q: string, args: string[]): CommandResult => {
            const aliases = store.get();
            args.forEach(x => delete aliases[x]);
            store.set(aliases);
            return {
                text: "Usage: rm cmd1 cmd2 cmd3<br>"
            };
        }
    }
}

function MakeExportCommand(store: Store) {
    return {
        desc: "Output the current aliases for sharing",
        usage: "export",
        gen: (q: string, args: string[]): CommandResult => {
            return {
                "text": "<textarea class='textarea config-textarea' placeholder='Config string' rows=20>" + JSON.stringify(store.get()) + "</textarea>"
            }
        }
    }
}

export interface CommandMap {
    [key: string]: Command
}

export function coreCommands(store: Store): CommandMap {
    return {
        "help": HelpCommand,
        "alias": AliasCommand(store),
        "rm": RemoveCommand(store),
        "import": ImportCommand(store),
        "export": MakeExportCommand(store),
    }
};
