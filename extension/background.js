let cachedPkgs = {};
let cachedFuncs = {};
let docHost = "";
let lastPkg = "";

const tryHosts = [
  "http://localhost:6060",
  "https://tip.golang.org",
];

function highlight(text, word) {
  text = text.replace(newRegExpHighlight(word), "\0$1\1");
  text = text.replace(newRegExpFuzzy(word), m => "\0" + m + "\1");

  return htmlSafe(text).replace(new RegExp("\0", "g"), "<match>")
                       .replace(new RegExp("\1", "g"), "</match>");
}

function htmlSafe(unsafe) {
  return unsafe.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}

function sendXHR(host, url) {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", host+url, false);
  try {
    xhr.send();
  } catch(e) {
    console.error("Could not fetch", host+url);
  }
  return xhr.status && xhr.responseText;
}

function getPkgsHTML(url) {
  let html = '';
  for(let i = 0 ; i < tryHosts.length && !html ; i++) {
    docHost = tryHosts[i]
    html = sendXHR(docHost, url) || '';
  }
  return html;
}

function pkgFuncs(pkg) {
  if(cachedFuncs[pkg] && Object.keys(cachedFuncs[pkg]).length > 0) {
    return cachedFuncs[pkg];
  }

  let div = document.createElement('div');
  div.innerHTML = getPkgsHTML('/pkg/' + pkg);

  cachedFuncs[pkg] = {};
  div.querySelector('#manual-nav').querySelectorAll('dd a').forEach(function(a) {
    const synopsis = a.innerText;
    const name = a.attributes.href.value.substring(1);
    cachedFuncs[pkg][name] = {
      name: name,
      synopsis: synopsis,
    };
  });
  return cachedFuncs[pkg];
}

function allPkgs() {
  if(Object.keys(cachedPkgs).length > 0) {
    return cachedPkgs;
  }

  let div = document.createElement('div');
  div.innerHTML = getPkgsHTML('/pkg/');

  cachedPkgs = {};
  div.querySelectorAll('.pkg-dir tr').forEach(function(tr) {
    const link = tr.querySelector('.pkg-name a');
    if(!link) { return; }

    const synopsis = tr.querySelector('.pkg-synopsis').innerText.replace(/\s*(.*?)\s*/, "$1");
    const name = link.attributes.href.value.replace(/\/$/, '');
    cachedPkgs[name] = {
      name: name,
      synopsis: synopsis,
    };
  });
  return cachedPkgs;
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function newRegExpExact(word) {
  return new RegExp(escapeRegExp(word), 'i');
}

function newRegExpHighlight(word) {
  return new RegExp("(" + escapeRegExp(word) + ")", 'ig');
}

function newRegExpFuzzy(word) {
  return new RegExp(word.split('').map(ch => escapeRegExp(ch)).join('.{0,10}?'), 'i');
}

function score(name, query, synopsis) {
  if(name.match(newRegExpExact(query))) {
    return (1 - wordsLenDiff(name, query));
  }
  if(name.match(newRegExpFuzzy(query))) {
    return (1 - wordsLenDiff(name, query))/2.0;
  }
  if(!synopsis) {
    return 0;
  }
  if(synopsis.match(newRegExpExact(query))) {
    return (1 - wordsLenDiff(synopsis, query))/2.0;
  }
}

function wordsLenDiff(word1, word2) {
  const len1 = word1.length;
  const len2 = word2.length;
  return Math.abs(len1-len2) / Math.max(len1, len2);
}

function sortedPkgs(pkgQuery) {
  return Object.keys(allPkgs())
    .sort(function(name1, name2) {
      const score1 = score(name1, pkgQuery);
      const score2 = score(name2, pkgQuery);
      if(score1 < score2) return 1;
      if(score1 > score2) return -1;
      return 0;
    })
    .map(name => allPkgs()[name])
    .slice(0, 5);
}

function sortedFuncs(pkg, funcQuery) {
  return Object.keys(pkgFuncs(pkg))
    .sort(function(name1, name2) {
      const score1 = score(name1, funcQuery);
      const score2 = score(name2, funcQuery);
      if(score1 < score2) return 1;
      if(score1 > score2) return -1;
      return 0;
    })
    .map(name => pkgFuncs(pkg)[name])
    .slice(0, 5);
}

function parseUserInput(text) {
  if(text.length === 0) { return; } // TODO: suggest most commonly used

  let words = text.split(/[\s#]+/, 2)
  let pkgQuery = words[0].replace(/\/$/, '');
  let funcQuery = words[1];

  if(words[0].length === 0 && lastPkg) {
    pkgQuery = lastPkg;
  }

  if(pkgQuery) {
    lastPkg = pkgQuery;
  }

  if(text.match(/\s$/) || words.length > 1) {
    let pkg = sortedPkgs(pkgQuery)[0];
    return sortedFuncs(pkg.name, funcQuery)
      .map(r => ({
        content: `${pkg.name}/#${r.name}`,
        description: `<url>${highlight(pkg.name, pkgQuery)}#${highlight(r.name, funcQuery)}</url> ${highlight(r.synopsis, '')}`,
      }));
  } else {
    return sortedPkgs(pkgQuery).map(r => ({
      content: r.name,
      description: `<url>${highlight(r.name, pkgQuery)}</url> ${highlight(r.synopsis, '')}`,
    }));
  }
}

chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    suggest(parseUserInput(text));
  }
);

chrome.omnibox.onInputEntered.addListener(
  function(text) {
    if (text === "!") {
      cachedPkgs  = {};
      cachedFuncs = {};
      return;
    }
    let results = parseUserInput(text);
    if(results.length === 0) return;
    let url = `${docHost}/pkg/${results[0].content}`;
    chrome.tabs.create({url: url});
  }
);
