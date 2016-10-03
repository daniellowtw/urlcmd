/*
    parseArgs takes a string and returns a list of arguments that can be separated by quotes.
    Example:    
    "hello world" 123 1 -v -c help -> ["hello world", 123, 1, "-v", "-c", "help"]
*/
export default function parseArgs(s) {
    // good case, string doesn't contain any quotes or -
    if (! /['"]/.test(s)) {
        return s.split(" ");
    }
    var spaceSeparatedList = s.split(" ");
    var res = [];
    var currWord = "";
    var currIndex = 0;
    // each loop emits one word into res
    do {
        var word = "";
        var lookFor = "";
        currWord = spaceSeparatedList[currIndex];
        currIndex++;
        switch (currWord[0]) {
            case '"':
                lookFor = '"';
                currWord = currWord.substr(1);
                break;
            case "'":
                lookFor = "'";
                currWord = currWord.substr(1);
                break;
        }

        if (lookFor == "") {
            res.push(currWord);
            continue;
        }

        // move currIndex and update word until we find a matching quote
        while ((currWord[currWord.length - 1] != lookFor) && (currIndex < spaceSeparatedList.length)) {
            if (word != "") {
                word += ` ${currWord}`;
            } else {
                word = currWord;
            }
            currWord = spaceSeparatedList[currIndex];
            currIndex++;
            if (currWord === undefined) {
                // TODO: maybe throw an error?
                return spaceSeparatedList;
            }
        }
        // we found a currWord with the matching quote
        word += ` ${currWord}`;
        word = word.substring(0, word.length - 1);
        res.push(word);
    } while (currIndex < spaceSeparatedList.length)

    return res;
}