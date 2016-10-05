import cmd from './command.js';

function makeFormatCmd() {
    var c = new cmd();
    c.run = (args) => {
        var s = args[0];
        args.shift();
        return s.replace(/{(\d+)}/g, (match, number) => {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    }
    return c.run;
}

function makeRedirectCmd() {
    var c = new cmd();
    c.addArg("url", "", "url to redirect to")
    c.run = (args) => {
        window.location.assign(url);
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, (tabs) => {
            chrome.tabs.update(tabs[0].id, {
                url: url
            });
        });
    }
    return c.run;
}

export default {
    format: makeFormatCmd(),
    redirect: makeRedirectCmd()
}