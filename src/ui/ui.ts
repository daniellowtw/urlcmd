import { App } from '../commands/app';
import { Command, CommandForPrinting } from '../commands/command';

declare var completely: any;
export interface FrontEnd {
    displayContent(content: string): void
    listAllCommands(result: CommandForPrinting[]): void
}

export class NoopUI implements FrontEnd {
    displayContent() { }
    listAllCommands(result: CommandForPrinting[]) { }
}

export class windowUI {
    constructor(app: App) {
        document.addEventListener("DOMContentLoaded", (event) => {
            this.setUpHelp();
            this.setUpLoad(app);
            this.setUpAutoComplete(app);
            app.setFrontEnd(this)
            // since we have a UI now and it was clearly not a redirect, execute the command again.
            // TODO: Make this reuse the result instead of recomputing.
            app.executeCmd(window.location)
        });
    }

    // Writes the given content into the correct div
    displayContent(content: string) {
        // If updating fails because dom is not loaded, then wait for it to load.
        try {
            document.getElementById('content')!.innerHTML = content;
        } catch (e) {
            document.addEventListener("DOMContentLoaded", (event) => {
                document.getElementById('content')!.innerHTML = content;
            });
        }
    }

    listAllCommands(result: CommandForPrinting[]) {
        // If updating fails because dom is not loaded, then wait for it to load.
        try {
            document.getElementById('list-all-content')!.innerHTML = this.displayEntries(result);
        } catch (e) {
            document.addEventListener("DOMContentLoaded", (event) => {
                document.getElementById('list-all-content')!.innerHTML = this.displayEntries(result);
            });
        }
    }

    /* UI STUFF */

    // setUpHelp bootstraps the help mechanism.
    setUpHelp() {
        var helpEl = document.getElementById('help')
        if (!helpEl) return
        var currentClass = helpEl.className
        document.getElementById('helpOpen')!.onclick = () => {
            helpEl!.className += " is-active";
        }
        const closeButton = helpEl.lastElementChild! as HTMLElement
        closeButton.onclick = () => {
            helpEl!.className = currentClass;
        }
    }

    // setUpLoad bootstraps the load mechanism.
    setUpLoad(app: App) {
        const loadEl = document.getElementById('load')
        if (!loadEl) return
        const currentClass = loadEl.className

        const importStuff = () => {
            const x: string = (document.getElementById('importContent')! as HTMLTextAreaElement).value;
            try {
                var res = JSON.parse(x)
                app.importStuff(res)
                loadEl.className = currentClass;
                this.displayContent("loaded")
                this.listAllCommands(app.listAll())
            } catch (err) {
                alert("loading: " + err)
            }
        }

        document.getElementById('loadOpen')!.onclick = () => {
            loadEl.className += " is-active";
        }
        // add handler for cancel button
        document.getElementById('submitLoadBtn')!.onclick = importStuff
        // add handler for cancel button
        document.getElementById('cancelLoadBtn')!.onclick = () => {
            loadEl.className = currentClass;
        }
        // add handler for top right cross
        const closeButton = loadEl.lastElementChild! as HTMLElement
        closeButton.onclick = () => {
            loadEl.className = currentClass;
        }
    }

    // displayEntries takes a result and returns a html string for representing the result in a table
    displayEntries(result: CommandForPrinting[], opts?: any): string {
        var opts = opts || {};
        if (opts.withSort) {
            result.sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }

        var res = ""
        res += "<h2>Available commands</h2>";
        res += '<table class="table is-bordered is-striped is-narrow">';

        for (var i = 0; i < result.length; i++) {
            const styleDesc = result[i].color ? 'style="color:' + result[i].color + ';"' : "";
            res += "<tr><td " + styleDesc + ">" + result[i].name + "&nbsp;</td>";
            const cmdObject = result[i].cmdObj;
            if (cmdObject.target) {
                res += "<td><i>" + cmdObject.target + "</i></td>";
            } else {
                res += "<td>" + (cmdObject.desc || "") + (cmdObject.example ? "<br>" + cmdObject.example : "") + "</td>";
            }
            res += "</tr>\n";
        }

        res += "</table><br/>";
        res += "General usage is: <tt>cmd [query]</tt>";
        return res
    }

    setUpAutoComplete(app: App) {
        var pv = completely(document.getElementById('container-search'));
        pv.options = [];
        pv.repaint();

        pv.onChange = (text: string) => {
            if (text.length == 0) {
                pv.options = [];
                pv.repaint();
                return;
            }
            var oj = this.doSearch(text, app.listAll());
            pv.options = [];
            for (var i in oj) { pv.options.push(oj[i].usage || oj[i].name); }
            pv.repaint();
            pv.input.focus();
        };

        // Hacks to fix stying of the generated elements
        pv.input.className = "input"
        pv.input.placeholder = "Command. Try 'help'"
        pv.hint.className = "input"
        pv.prompt.className = "input"
        pv.wrapper.className = "control has-addons"

        // Trigger search when user enters
        pv.onEnter = () => {
            this.doQuery(pv.input.value);
            app.executeCmd(window.location);
            pv.setText('');
        }

        setTimeout(() => {
            pv.input.focus();
        }, 0);
    }

    doSearch(text: string, commands: CommandForPrinting[]): any {
        // TODO: cache this so we don't always update
        var res: any = [];
        commands.forEach(x => {
            res.push({ "name": x.cmdObj.desc, "usage": x.cmdObj.usage || undefined })
        })
        return res;
    }

    doQuery(query: string) {
        if (query === "") {
            var el = document.getElementById("query-text") as HTMLTextAreaElement;
            if (!el) {
                return
            }
            query = el.value || "";
            el.value = "";
        }
        window.location.href = 'index.html#' + query; // Will not trigger refresh
    }
}
