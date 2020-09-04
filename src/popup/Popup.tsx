import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { listAll, UICommand } from '../loader';
import { CommandResult, getHistory } from '../cmd';
import { setUpAutoComplete } from '../App';

const App = () => {
    const [uiCommands, setUiCommands] = useState<UICommand[]>(listAll())
    const searchRef = useRef<HTMLDivElement>()
    const [result, setResult] = useState<CommandResult>()
    const [history, setHistory] = useState<Array<string>>([])

    const updateState = () => {
        setUiCommands(listAll())
    }

    useEffect(() => {
        setUpAutoComplete(searchRef.current, r => {
            updateState()
            setResult(r)
            getHistory().then(x => {
                console.log(x)
                setHistory(x)
            })
        })
    }, [])
    return <div style={{width:"400px", height: "100px"}}>
                <div id="content">
                    {result && result.text && <div>
                        <pre>
                    {result.text}
                        </pre>
                        <pre>
                    {JSON.stringify(history)}
                        </pre>
                    </div>}
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