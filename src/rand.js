function random(name, utils) {
    return {
        "desc": "Generate a random number from 1 to n inclusive, optional second argument for generating m numbers",
        "example": name + " 6 -> 3 </br>" + name + " 4 2 -> 1 1",
        "usage": name + " n [m]",
        "gen": function(n, m) {
            function random(n, m) {
                var nn = parseInt(n, 10)
                var mm = (m === undefined) ? 1 : parseInt(m, 10)
                if (isNaN(nn) || isNaN(mm)) {
                    return "cannot parse n or m as integers."
                }
                var s = ""
                for (var i = 0; i < mm; i ++) {
                    s += Math.ceil(Math.random() * nn) + "</br>"
                }
                return s
            }
            return {
                "text": random(n, m)
            };
        },
    }
}