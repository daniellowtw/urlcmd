import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { listAll, UICommand } from '../loader';
import { CommandResult } from '../cmd';
import { setUpAutoComplete } from '../App';

const App = () => {
    const [uiCommands, setUiCommands] = useState<UICommand[]>(listAll())
    const searchRef = useRef<HTMLDivElement>()
    const [showImport, setShowImport] = useState(false)
    const [result, setResult] = useState<CommandResult>()

    const updateState = () => {
        setUiCommands(listAll())
    }

    useEffect(() => {
        setUpAutoComplete(searchRef.current, r => {
            updateState()
            setResult(r)
        })
    }, [])
    return <div style={{width:"400px"}}>
                <div id="content">
                    {result && result.text && <pre>
                    {result.text}
                    </pre>}
                </div>
        <div ref={searchRef}/>
    </div>
}

ReactDOM.render(
    <div>
        <App />
    </div>,
    document.getElementById('app')
);