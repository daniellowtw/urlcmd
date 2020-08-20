import { makeList } from "./cmd";
import { splitArgs, applyLoader } from "./loader";
import { getAliases } from "./store";


export function format() {
  var newArguments = [].slice.call(arguments, 1);
  var args = newArguments;
  var s = arguments[0];
  return s.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] != "undefined" ? args[number] : match;
  });
}

export function redirect(url: string) {
  window.location.assign(url);
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      chrome.tabs.update(tabs[0].id, {
        url: url,
      });
    }
  );
}

// navigate redirects the browser to the given url
export function navigate(url) {
  window.location.assign(url);
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      chrome.tabs.update(tabs[0].id, {
        url: url,
      });
    }
  );
}

export function doQuery(text: string): Promise<void> {
    var query = text;
    if (query === "") {
        const el: HTMLInputElement = document.getElementById("query-text") as HTMLInputElement;
        query = el.value;
        el.value = "";
    }
    window.location.href='index.html#' + query; // Will not trigger refresh
    return executeCmd();
}


export function executeCmd(): Promise<void> {
    var searchQuery = splitArgs(window.location).q;
    if (searchQuery) {
        document.title = searchQuery;
        var r = applyLoader(searchQuery);
        if (r) {
          console.log(r)
            if (r.url) {
                navigate(r.url);
            } else if (r.text) {
                console.log(r.text)
            }
        } else {
            console.log("not found")
        }
    }
    return Promise.resolve()
}

export function doSearch(text) {
    // TODO: cache this so we don't always update
    var list = makeList(getAliases());
    var res = [];
    list.forEach(x => {
        res.push({"name":x["name"], "usage": x["usage"]||undefined})
    })
    return res;
}