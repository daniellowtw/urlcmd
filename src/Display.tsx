import React from 'react';
import { UICommand } from './loader';

const Display: React.FC<{ kvs: UICommand[] }> = ({ kvs }) => {
    return <div>
        <h2>Available commands</h2>
        <table className={"table is-bordered is-striped is-hoverable"} width={"100%"}>
            <tbody>
                {kvs.map((kv: UICommand, idx: number) => {
                    const desc = (typeof kv.cmdObject.desc === "string") ? [kv.cmdObject.desc] : kv.cmdObject.desc
                    const examples = (typeof kv.cmdObject.example === "string") ? [kv.cmdObject.example] : kv.cmdObject.example
                    return <tr key={kv.cmd ?? idx}>
                        <td>{kv.cmd ?? "error"}</td>
                        <td style={kv.style ?? {}}>
                            {desc.map(l => <p key={l}>{l}</p>)}
                            {examples && examples.map(l => <p key={l}>{l}</p>)}
                        </td>
                    </tr>
                }
                )}
            </tbody>
        </table>
        <p>
            General usage is: <span>cmd [query]</span>
        </p>
    </div>
}

function renderValue(s: string) {
    if (s.startsWith("http")) {
        return <a href={s}>{s}</a>
    }
    return s
}

export default Display;