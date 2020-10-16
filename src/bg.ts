import { getHistory, setHistory } from "./store";

var HISTORY_KEY = 'sbHistory';
var sbHistory = getHistory();

chrome.commands.onCommand.addListener(function(command) {
    console.log(1)
    chrome.tabs.create({
        url: chrome.extension.getURL('index.html')
    });
});


async function parseUserInput(text: string) {
    var res = (await sbHistory).map(x => {
        return {
            "content": x,
            "description": x,
        }
    })
    return res || []
}


chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({history: []}, function() {
  });
});

// This is triggered when the input changes
chrome.omnibox.onInputChanged.addListener(
    async function(text, suggest) {
        const res = await parseUserInput(text)
        suggest(res);
    }
);

// This is triggered when entered is pressed
chrome.omnibox.onInputEntered.addListener(
    async function(text) {
        const sbHistory = await getHistory()
        setHistory(text)
        chrome.tabs.update(null, {
            url: chrome.extension.getURL(`index.html#${text}`)
        });
    }
);