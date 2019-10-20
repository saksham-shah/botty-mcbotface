module.exports = (commandName) => {
    return (new BotCommand()).setName(commandName);
}

class BotCommand {
    constructor() {
        // Name used by users to call this command
        this.commandName = null;
        // Function called when a user types the command
        this.handler = null;
        // Details on the help text of the command
        this.helpOptions = null;
    }

    getName() {
        return this.commandName;
    }

    setName(name) {
        this.commandName = name;
        return this;
    }

    setHandler(fn) {
        this.handler = fn;
        return this;
    }

    getHelp() {
        return this.helpOptions;
    }

    setHelp(help) {
        this.helpOptions = help;
        return this;
    }

    // Adds the command to an object
    addToDict(obj) {
        obj[this.commandName] = this;
        return obj;
    }
}