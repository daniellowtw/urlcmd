import React, { useEffect, useState, useRef } from 'react';
import Tab = chrome.tabs.Tab;
import Display from './Display';
import { listAll, UICommand } from './loader';
import { executeCmd, doSearch, doQuery } from './core';
import { completely } from './completely/completely';
import { importConfig } from './store';


function setUpAutoComplete(el: HTMLDivElement, cb: () => void) {
    var pv: any = completely(el);
    pv.options = [];
    pv.repaint();

    pv.onChange = function (text) {
        if (text.length == 0) {
            pv.options = [];
            pv.repaint();
            return;
        }
        var oj = doSearch(text);
        pv.options = [];
        for (var i in oj) { pv.options.push(oj[i].usage || oj[i].name); }
        pv.repaint();
        pv.input.focus();
    };

    // Hacks to fix styling of the generated elements
    pv.input.className = "input"
    pv.input.placeholder = "Command. Try 'help'"
    pv.hint.className = "input"
    pv.prompt.className = "input"
    pv.wrapper.className = "control has-addons"

    // Trigger search when user enters
    pv.onEnter = function () {
        doQuery(pv.input.value).then(cb);
        pv.setText('');
    }

    setTimeout(function () {
        pv.input.focus();
    }, 0);
}

const App = () => {
    const [uiCommands, setUiCommands] = useState<UICommand[]>(listAll())
    const searchRef = useRef<HTMLDivElement>()
    const [showImport, setShowImport] = useState(false)

    const updateState = () => {
        setUiCommands(listAll())
    }

    useEffect(() => {
        executeCmd();
        setUpAutoComplete(searchRef.current, updateState);
    }, [])

    return (<>
        <section className="section">
            <div className="container">
                <div className="navbar">
                    <div className="navbar-start">
                        <div className="header-item">
                            <p className="title">
                                <a href="index.html">URL Command</a>
                            </p>
                        </div>
                    </div>
                    <div className="navbar-end">
                        <a className="button is-primary" id="loadOpen" onClick={() => setShowImport(s => !s)}>Load config</a>
                        {/* <a className="button" id="helpOpen">Install</a> */}
                    </div>
                </div>
                <div ref={searchRef} id='container-search'></div>
                <br />
                <div id="content"></div>
                <hr />
                <div id="list-all-content"></div>
                <div>
                    <Display kvs={uiCommands} />
                </div>
            </div>
        </section>
        <button className="modal-close"></button>
        {showImport && <ImportModal done={() => {
            setShowImport(false)
            updateState()
        }} />}
    </>
    );
};

const ImportModal: React.FC<{ done: () => void }> = ({ done }) => {
    const [data, setData] = useState("")
    const handleSubmit = () => {
        importConfig(data)
        done()
    }
    return (
        <div className="modal is-active" id='load'>
            <div className="modal-background"></div>
            <div className="modal-content">
                <div className="box">
                    <div className="content">
                        <label className="label">Load</label>
                        <p className="control">
                            <textarea className="textarea config-textarea" placeholder="Config string" id="importContent" onChange={ev => setData(ev.target.value)}></textarea>
                        </p>
                        <p className="control">
                            <button className="button is-primary" id="submitLoadBtn" onClick={handleSubmit}>Submit</button>
                            <button className="button" id="cancelLoadBtn" onClick={done}>Cancel</button>
                        </p>
                    </div>
                </div>
            </div>
            <button className="modal-close"></button>
        </div>
    )
}

function helpModal() {
    return (
        <div className="modal" id='help'>
            <div className="modal-background"></div>
            <div className="modal-content">
                <div className="box">
                    <div className="content">
                        <h1>How to install</h1>
                        <p>To install <strong>URL Command</strong>:</p>

                        <h3>On Chrome</h3>
                        <ol>
                            <li>Create a new tab (Ctrl T) so you can still view the instructions here</li>
                            <li>Copy and paste chrome://settings/searchEngines into the url bar</li>
                            <li>Add https://daniellowtw.github.io/urlcmd/#%s as a custom search engine</li>
                            <li>Pick a keyword, for example <strong>sb</strong></li>
                        </ol>

                        <h3> On Firefox/Opera/Vivaldi </h3>
                        <ol>
                            <li>Right click the following field: <form method="get">
                                <input type="search" name="q" />
                            </form>
                            </li>
                            <li>Choose "Add As Search Engine..."</li>
                            <li>Pick a keyword, for example <strong>sb</strong></li>
                        </ol>
                        <p>
                            Now you can access it by typing
                            sb &lt;command [query]&gt; in the URL bar. Try
                            sb list
                                </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App;