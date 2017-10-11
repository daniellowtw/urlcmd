import { Command } from '../command';
export const TranslateCommand: Command = {
    desc: "Google Translate",
    usage: "tr [[from]:[to]] text",
    example: "Example: tr ro:fr buna ziua",
    gen: function (q: string) {
        if (!q) {
            return {
                text: this.example
            };
        }
        var components = q.match(/^(([a-zA-Z\-]*):([a-zA-Z\-]*)\s+)?(.*$)/);
        var from = components![2] || 'auto';
        var to = components![3] || 'en';
        var text = components![4];
        return {
            url: "https://translate.google.com/#" + from + "/" + to + "/" + text
        };
    }
}