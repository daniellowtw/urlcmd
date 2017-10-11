import { Command } from '../command';
export const NotepadCommand: Command = {
    desc: "create a scratch pad",
    usage: "notepad",
    gen: function () {
        return {
            url: "data:text/html,<html contenteditable>"
        };
    }
}