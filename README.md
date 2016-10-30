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

Webapp: Go to <https://daniellowtw.github.io/urlcmd> and click on `Install` at the top right.

Chrome extension : <https://chrome.google.com/webstore/detail/urlcmd/eeinlddplcljmdnfbghaamjhbgolnbni> 
Alt-G or prefix your command with `url` in the URL bar.

## Third party functions

* Greatest common divisor `import gcd examples/gcd.js`
* Random number generator `import rand examples/rand.js`
* Binary <-> ascii `import bin examples/bin.js`
