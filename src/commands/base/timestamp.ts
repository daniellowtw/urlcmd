import { Command, CommandResult } from '../command';
export const TimestampCommand: Command = {
    desc: "Unix timestamp conversion",
    gen: function (q: string): CommandResult {
        if (!q) {
            return {
                text: Math.floor(new Date().getTime() / 1000).toString()
            };
        } else {
            return {
                text: new Date(parseInt(q, 10) * 1000).toString()
            }
        }
    }
}