import React from "react";
import ReactDOM from 'react-dom';
import Display from "./Display";

console.log("transforming...")

function toObject(s: string) {
  const res = {};
  s.split("\n").forEach((element) => {
    const kv = element.split(":").map((x) => x.trim());
    res[kv[0]] = kv[1];
  });
  return res
}

const linere = /(.*?):\s(.*)/
function toArrayList(s: string) {
  const res = [];
  s.split("\n").forEach(e => {
    const matches = linere.exec(e)
    res.push([matches[1], matches[2]])
  })
  return res
}

var x = document.body.textContent;
console.log(x)
const data = toArrayList(x)

document.body.innerHTML = '';
const app = document.createElement("div")
app.setAttribute("id", "app");
document.body.appendChild(app)

ReactDOM.render(
  <Display kvs={data} />,
  document.getElementById('app')
);