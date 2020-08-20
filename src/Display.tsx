import React from 'react';
import { UICommand } from './loader';

const Display: React.FC<{ kvs: UICommand[] }> = ({ kvs }) => {
    return <div>
        <h2>Available commands</h2>
        <table className={"table is-bordered is-striped is-narrow is-hoverable"}>
            <tbody>
                {kvs.map((kv: UICommand, idx: number) => {
                    const desc = (typeof kv.cmdObject.desc === "string") ? [kv.cmdObject.desc] : kv.cmdObject.desc
                    console.log(desc)
                    return <tr key={kv.cmd ?? idx}>
                        <td>{kv.cmd ?? "error"}</td>
                        <td style={kv.style ?? {}}>
                            {desc.map(l => <p>{l}</p>)}
                            <p>{kv.cmdObject.example ?? ""}</p>
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