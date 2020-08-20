import { CommandSet, CommandResult, Command, coreCommands, baseCommands } from "./cmd";
import { format } from "./core";
import { CSSProperties } from "react";
import { getAliases } from "./store";

export interface CommandLoader {
  name?: string;
  gen: (q: string) => CommandResult | null;
  list: () => UICommand[];
}

export interface UICommand {
  cmd: string;
  cmdObject: Command;
  style?: CSSProperties;
}

// CommandSetLoader tries to execute the command in the command set that corresponds to the name
export function CommandSetLoader(name: string, commandSet: CommandSet, opts?: {listStyle?: CSSProperties}): CommandLoader {
  return {
    name, 
    gen: function (q) {
      const components = q.split(" ");
      const cmdName = components[0].toLowerCase();
      const args = q.substring(components[0].length + 1);
      const params = parseArgs(args);
      const cmd = commandSet[cmdName];
      if (cmd && cmd.target) {
        return applyLoader(cmd.target + " " + args);
      }
      if (!cmd) {
        return null;
      }
      if ((!args || !cmd.url) && cmd.urlNoArgs) {
        return {
          url: cmd.urlNoArgs,
        };
      } else if (cmd.url) {
        params.unshift(cmd.url);
        return {
          url: format.apply(null, params),
        };
      } else if (cmd.gen) {
        return cmd.gen(args, params);
      }
      return null;
    },
    list: () => {
      var result: UICommand[] = [];
      for (var key in commandSet) {
        result.push({
          cmd: key,
          cmdObject: commandSet[key],
          style: (opts || {}).listStyle,
        });
      }
      return result;
    },
  };
}

export function parseArgs(s: string): string[] {
  if (s.indexOf(`"`) == -1) {
    return s.split(" ");
  }
  var spaceSeparatedList = s.split(" ");
  var res = [];
  var currWord = "";
  var currIndex = 0;
  do {
    currWord = spaceSeparatedList[currIndex];
    currIndex++;
    if (currWord[0] == '"') {
      currWord = currWord.substr(1);
      while (
        currWord[currWord.length - 1] != '"' &&
        currIndex < spaceSeparatedList.length
      ) {
        var temp = spaceSeparatedList[currIndex];
        currIndex++;
        if (temp === undefined) {
          return spaceSeparatedList;
        }
        currWord += ` ${temp}`;
        currWord = currWord.substring(0, currWord.length - 1);
      }
    }
    res.push(currWord);
  } while (currIndex < spaceSeparatedList.length);
  return res;
}

// try and use all the given loaders on the query text.
// TODO: Check for infinite loop.
export function applyLoader(text: string): CommandResult {
  for (var i = 0; i < loaders.length; i++) {
    var r = loaders[i].gen(text);
    if (r) {
      return r;
    }
  }
}
function AliasLoader() {
  return CommandSetLoader("alias", getAliases(), {
    listStyle: {"color": "red"},
  });
}

function FallbackLoader(r): CommandLoader {
  return {
    gen: function (q) {
      if (/%s/.test(r.url)) {
        return {
          url: r.url.replace("%s", encodeURIComponent(q)),
        };
      }
      listAll();
      return {};
    },
    list: function () {
      return [];
    },
  };
}

const loaders: CommandLoader[] = [
  AliasLoader(),
  CommandSetLoader("core", coreCommands, {
    listStyle: {color: "navy"},
  }),
  CommandSetLoader("base", baseCommands),
  // FallbackLoader(coreCommands["help"])
];

export function listAll(): UICommand[] {
  var result: UICommand[] = [];
  var seen = {};
  // hacks to make sure we load latest aliases
  loaders[0] = AliasLoader();
  for (var i = 0; i < loaders.length; i++) {
    if (!loaders[i].list) {
      continue;
    }
    var l = (
      loaders[i].list ||
      function () {
        return [];
      }
    )();
    for (var j = 0; j < l.length; j++) {
      if (!seen[l[j].cmd]) {
        result.push(l[j]);
        seen[l[j].cmd] = true;
      }
    }
  }
  return result;
}

// splitArgs parses the query from the url. It converts ?q=foo%20bar%20car into {"q":"foo bar car"}
export function splitArgs(loc: Location): { [k: string]: string } {
  var hash = loc.hash.substr(1);
  hash = decodeURIComponent(hash);
  if (hash !== "") {
    return { q: hash };
  }
  const s = decodeURIComponent(loc.search);
  var result = {};
  var pairs = s.split(/[&?]/);
  for (var i = 0; i < pairs.length; i++) {
    if (!pairs[i]) {
      continue;
    }
    var groups = /([^=]*)(=(.*$))?/.exec(pairs[i]);
    result[groups[1]] = decodeURIComponent(groups[3].replace(/\+/g, "%20"));
  }
  return result;
}
