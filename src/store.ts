import { CommandSet } from "./cmd";

export const ALIASES_KEY = "urlcmd";
export function getAliases(): CommandSet {
  try {
    return JSON.parse(localStorage.getItem(ALIASES_KEY)) || {};
  } catch (ex) {
    console.error(ex);
    return {};
  }
}

export function setAliases(aliases) {
  localStorage.setItem(ALIASES_KEY, JSON.stringify(aliases));
}

export function importConfig(x: string): Promise<void>{
  try {
    JSON.parse(x)
    localStorage.setItem(ALIASES_KEY, x);
  } catch (err) {
    alert("loading: " + err);
  }
  return Promise.resolve()
}

export function getHistory(): Promise<string[]> {
    return new Promise(r => {
    try {
        chrome.storage.sync.get(['history'], function (x) {
            r(x.history || [])
        })
    } catch (ex) {
        r([])
    }

    })
}

export function setHistory(value) {
    console.log("setting history")
        chrome.storage.sync.get(['history'], function (x: {history: string[]}) {
            console.log("store is ", x)
            x.history.unshift(value)
        if (x.history.length > 15) {
            x.history = x.history.slice(0, 15)
        }
            chrome.storage.sync.set({history: x.history}, function() {
                console.log("updated")
            })
        })
}
