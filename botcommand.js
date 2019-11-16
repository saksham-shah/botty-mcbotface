var perms = require('./permissions.js');

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
        // Some commands are only avaliable to the admin (me)
        this.admin = false;
        // Some commands may be disabled
        this.disabled = false;
        // Some commands have required permissions
        this.permissions = -1;
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
        if (!help.category) {
            help.category = 'General';
        }
        if (help.important === undefined) {
            help.important = true;
        }
        if (!help.syntax) {
            help.syntax = '';
        }
        this.helpOptions = help;
        return this;
    }

    setPermissions() {
        this.permissions = perms.getPermNum(...arguments);
        return this;
    }

    getPermissions() {
        return this.permissions;
    }

    // Sets a command as admin only
    adminOnly() {
        this.admin = true;
        return this;
    }

    // Disables a command
    disable() {
        this.disabled = true;
        return this;
    }

    // Adds the command to an object
    addToDict(obj) {
        obj[this.commandName] = this;
        return obj;
    }
}