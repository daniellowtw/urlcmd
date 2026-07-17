# URL command

Try it at <https://daniellowtw.github.io/urlcmd>

## Introduction

This is a productivity tool by hacking the browser's custom search engine and treating the query string as a command with its arguments. It allows you to create aliases (shortcuts) for:

* Parameterised templated url (e.g. `https://<service>.<cluster>.yourdomain.com`)
* Built-in utility functions (e.g. `secs [timestamp]`)
* Third-party functions (e.g. `import <alias> <url>`)

This allows importing of personal aliases, like a portable `.bashrc`. Bring your keyboard ninja skills to someone else's machine today!

## Examples

The following assumes you've added the keyword `url` for the search engine, and will type the commands in the omnibox.

* `alias x http://xkcd.com` means typing `url x` will redirect you to `http://xkcd.com`.
* `alias gd https://godoc.org/?q={0}` means typing `url gd atomic` would search for atomic in another search engine.
* `import gcd examples/gcd.js` will import the `gcd` function so that typing `url gcd 14 21` will print `7`.
* `alias x` will remove the alias `x`

## Installation

Go to <https://daniellowtw.github.io/urlcmd> and add it as a custom search engine
(e.g. `chrome://settings/searchEngines`), or click `Install` at the top right to
add it via OpenSearch. Pick a keyword such as `url`, then type `url <command>` in
the address bar.

## Third party functions

* Greatest common divisor `import gcd examples/gcd.js`
* Random number generator `import rand examples/rand.js`
* Binary <-> ascii `import bin examples/bin.js`
