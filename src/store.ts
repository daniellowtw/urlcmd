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
