function gcd(name, utils) {
    return {
        "desc": "Calculate the gcd of two numbers",
        "example": name + " 5 6 -> 1",
        "gen":function(a,b) {
            function gcd(a,b){
                if (a > b ) {
                    return gcd(b,a);
                }
                if (b%a == 0) {
                    return a;
                }
                return gcd(b % a, a);
            }

            return {
                "text": gcd(a,b)
            };
        },
    }
}

