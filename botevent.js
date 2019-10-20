module.exports = (eventName) => {
    return (new BotEvent()).setName(eventName);
}

class BotEvent {
    constructor() {
        // Name used for this event in discord.js
        this.eventName = null;
        // Function called to handle this event
        this.handler = null;
    }

    setName(name) {
        this.eventName = name;
        return this;
    }

    setHandler(fn) {
        this.handler = fn;
        return this;
    }

    // Creates an event listener
    attachToClient(client) {
        // Must have an event name and handler
        if (!this.eventName || !this.handler) return false;
        client.on(this.eventName, (...args) => this.handler(client, ...args));
        return true;
    }
}