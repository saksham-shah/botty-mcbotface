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
        // Some commands have aliases
        this.aliases = [];
        // Some commands have cooldowns
        this.cooldown = 2;
        this.cooldowns = new Map();
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

    setAliases() {
        this.aliases = [...arguments];
        return this;
    }

    setCooldown(cooldown) {
        this.cooldown = cooldown;
        return this;
    }

    checkCooldown(userId) {
        const now = Date.now();

        if (this.cooldowns.has(userId)) {
            const expireTime = this.cooldowns.get(userId) + this.cooldown * 1000;
            if (now < expireTime) {
                return (expireTime - now) / 1000;
            }
        }
        return 0;
    }

    setUserCooldown(userId) {
        this.cooldowns.set(userId, Date.now());
        setTimeout(() => this.cooldowns.delete(userId), this.cooldown * 1000);
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
    addToMap(map) {
        map.set(this.commandName, this);
        return map;
    }
}