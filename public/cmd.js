var HISTORY_KEY = 'sbHistory';
var sbHistory = getHistory();

chrome.commands.onCommand.addListener(function(command) {
    console.log(1)
    chrome.tabs.create({
        url: chrome.extension.getURL('index.html')
    });
});


function parseUserInput(text) {
    var res = sbHistory.map(x => {
        return {
            "content": x.content,
            "description": x.description,
        }
    })
    return res || []
}

function setHistory(value) {
    console.log("setting history")
        chrome.storage.sync.get(['history'], function (x) {
            x.push(value)
            chrome.storage.sync.set({history: x}, function() {
                console.log("updated")
            })
        })
}

function getHistory() {
    console.log("getting history")
    try {
        chrome.storage.sync.get(['history'], function (x) {
        return x || []
        })
    } catch (ex) {
        return [];
    }
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({history: []}, function() {
  });
});

// This is triggered when the input changes
chrome.omnibox.onInputChanged.addListener(
    function(text, suggest) {
        suggest(parseUserInput(text));
    }
);

// This is triggered when entered is pressed
chrome.omnibox.onInputEntered.addListener(
    function(text) {

        if (text == "!clear") {
            setHistory([])
            sbHistory = []
            return
        }
        sbHistory.push({
            content: text,
            description: text, // TODO
        })
        if (sbHistory.length > 15) {
            sbHistory.shift()
        }
        setHistory(sbHistory)
        chrome.tabs.update(null, {
            url: chrome.extension.getURL(`index.html#${text}`)
        });
    }
);