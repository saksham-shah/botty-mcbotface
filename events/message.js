const fs = require('fs');

const Discord = require('discord.js');
const prefix = require('../botconfig.js').PREFIX;

var commands = {};

// Goes through all of the commands in the 'commands' folder and adds it to the object
fs.readdir('./commands/', (err, files) => {
    files.forEach(file => {
        require(`../commands/${file}`).addToDict(commands);
    })
})

module.exports = require('../botevent.js')('message').setHandler((client, message) => {
    // Only works in text channels for now
    if (!(message.channel instanceof Discord.TextChannel)) return;
    // Doesn't respond to itself
    if (message.member.user.id === client.user.id) return;
    // Ignores messages which don't start with the prefix
    if (!message.content.startsWith(prefix)) return;

    // Splits the message into command and commandArgs
    var messageWords = message.content.slice(prefix.length).split(' ');
    var command = messageWords.shift();
    var commandArgs = messageWords.join(' ');

    // Special case for 'help' command
    if (command == 'help') {
        commands.help.handler(message, client, commandArgs, commands);
        return;
    }

    // Only calls a handler if that command exists
    if (commands[command]) {
        commands[command].handler(message, client, commandArgs);
    }
});