// navigate redirects the browser to the given url
export function navigate(url: string) {
    window.location.assign(url);
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        if (tabs.length === 0 || !tabs[0].id) { return }
        chrome.tabs.update(tabs[0].id!, {
            url: url
        });
    });
}


// splitArgs parses the query from the url. It converts ?q=foo%20bar%20car into {"q":"foo bar car"}
export function splitArgs(loc: Location): { [key: string]: string } {
    var hash = loc.hash.substr(1);
    hash = decodeURIComponent(hash)
    if (hash !== "") {
        return { q: hash }
    }
    var s = decodeURIComponent(loc.search)
    var result: { [key: string]: string } = { q: "" };
    var pairs = s.split(/[&?]/);
    for (var i = 0; i < pairs.length; i++) {
        if (!pairs[i]) {
            continue;
        }
        const groups = /([^=]*)(=(.*$))?/.exec(pairs[i]);
        if (!groups) {
            break
        }
        const key: string = groups[1]
        result[key] = decodeURIComponent(groups[3].replace(/\+/g, '%20'));
    }
    return result;
}

