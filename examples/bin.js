function gcd(name, utils) {
    return {
        "desc": "convert between binary and string",
        "example": name + " s2b -> 1",
        "gen": function(type, s) {
            function binaryStringToString(x) {
                return x.split(" ").map(function(y) {
                    return String.fromCharCode(parseInt(y, 2))
                }).join("")
            }

            function stringToBinaryString(x) {
                return x.split("").map(function(x) {
                    return x.charCodeAt().toString(2)
                }).join(" ")
            }
            var text = "wrong usage";
            if (type == "b2s") {
                text = binaryStringToString(s)
            } else if (type == "s2b") {
                text = stringToBinaryString(s)
            }
            return {
                "text": text
            };
        },
    }
}
