import { splitArgs, navigate } from '../browser/browser';

export interface Command {
    desc: string
    usage?: string
    example?: string
    // This is an alias to another command
    target?: string

    // This is for redirecting
    url?: string
    urlNoArgs?: string

    genSrc?: boolean
    genString?: string

    gen: (q?: string, args?: any[]) => CommandResult
}

export interface CommandForPrinting {
    name: string
    cmdObj: Command
    color: string
}

export interface CommandResult {
    text?: string
    url?: string
}


/**
 * Takes a template and a list of values and replaces {0}, {1}, ... with the values from the list.
 * 
 * @export
 * @param {string} template 
 * @param {string[]} args 
 * @param {boolean} [urlEncode=false] 
 * @returns {string} 
 */
export function format(template: string, args: string[], urlEncode: boolean = false): string {
    return template.replace(/{(\d+)}/g, (match, number) => {
        if (typeof args[number] === 'undefined') {
            return ""
        }
        if (urlEncode) {
            return encodeURIComponent(args[number])
        }
        return args[number];
    });
}

export function redirect(url: string) {
    window.location.assign(url);
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        if (tabs.length === 0 || !tabs[0].id) {
            return
        }
        chrome.tabs.update(tabs[0].id!, {
            url: url
        });
    });
}

