/**
 * Takes the incoming string and parse it by semantic tokens. 
 * A semantic token is a word separated by spaces, or words within double quotes.
 */
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
        if (currWord[0] === '"') {
            currWord = currWord.substr(1)
            while ((currWord[currWord.length - 1] !== '"')
                && (currIndex < spaceSeparatedList.length)) {
                var temp = spaceSeparatedList[currIndex];
                currIndex++;
                if (temp === undefined) {
                    return spaceSeparatedList;
                }
                currWord += ` ${temp}`
            }
            currWord = currWord.substring(0, currWord.length - 1)
        }
        res.push(currWord);
    } while (currIndex < spaceSeparatedList.length)
    return res;
}
