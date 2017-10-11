import { CommandMap } from '../commands/core/core';
export interface Store {
    set(aliases: CommandMap): void
    get(): CommandMap
}

export class LocalStorageStore implements Store {
    ALIASES_KEY = "sb"
    set(aliases: CommandMap) {
        localStorage.setItem(this.ALIASES_KEY, JSON.stringify(aliases));
    }

    get() {
            const fromStore = localStorage.getItem(this.ALIASES_KEY)
            if (!fromStore) return {}
            return JSON.parse(fromStore);
    }
}