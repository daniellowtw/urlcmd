// parseArgs splits a command's argument string into words, keeping any
// double-quoted phrase as a single argument. Pure and side-effect free so it
// can be unit-tested directly from source (see test/parseArgs.test.ts).
export function parseArgs(s: string): string[] {
    if (s.indexOf('"') == -1) {
        return s.split(" ");
    }
    var spaceSeparatedList = s.split(" ");
    var res = [];
    var currIndex = 0;
    while (currIndex < spaceSeparatedList.length) {
        var currWord = spaceSeparatedList[currIndex];
        currIndex++;
        if (currWord[0] == '"') {
            currWord = currWord.substr(1);
            // Gather following words until we reach the one ending in a quote.
            while (currWord[currWord.length - 1] != '"'
                && currIndex < spaceSeparatedList.length) {
                currWord += ` ${spaceSeparatedList[currIndex]}`;
                currIndex++;
            }
            // Strip the trailing closing quote if it was found.
            if (currWord[currWord.length - 1] == '"') {
                currWord = currWord.substring(0, currWord.length - 1);
            }
        }
        res.push(currWord);
    }
    return res;
}
