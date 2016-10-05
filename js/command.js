/*
    A command has the following properties

    name - a name for the command
    desc - A short description
    usage - a short text to describe how to use the command
    example - using it in action
    gen - execute the function

    args - []
*/
export default class cmd {
    constructor(name = 'unnamed', run) {
        this.name = name;
        this.args = [];
        this.run = run;
        this.subcommand = [];
        this.desc = "TODO";
        this.help = "TODO";
        this.eg = "TODO";
    }

    addArg(long, defVal, desc, short) {
        this.args.push(new arg(long, defVal, desc, short));
    }

    addSubCmd(c) {
        this.subcommand.push(c);
    }
}

class arg {
    constructor(long, defVal, desc, short) {
        this.long = long;
        this.defVal = defVal;
        this.desc = desc;
        this.short = short;
        this.changed = false;
        this.value = undefined;
    }
}