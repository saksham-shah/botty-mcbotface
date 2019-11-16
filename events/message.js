const fs = require('fs');

const Discord = require('discord.js');
// const prefix = process.env.PREFIX;

const dbHelper = require('../database.js');
var cached = dbHelper.getCached();

const perms = require('../permissions.js');

var commands = {};

// Goes through all of the commands in the 'commands' folder and adds it to the object
checkDirectory('./commands');

async function checkDirectory(path) {
    fs.readdir(path, (err, contents) => {
        contents.forEach((pathName) => {
            var pathObj = fs.lstatSync(`${path}/${pathName}`);
            if (pathObj.isDirectory()) {
                checkDirectory(`${path}/${pathName}`);
            } else {
                var command = require(`.${path}/${pathName}`);
                if (!command.disabled) {
                    command.addToDict(commands);
                }
            }
        });
    });
}

module.exports = require('../botevent.js')('message').setHandler(async (client, message) => {
    // Special development channel
    if (process.env.STATUS === 'dev' && message.channel.id !== '638667677577248768') return;
    if (process.env.STATUS === 'prod' && message.channel.id === '638667677577248768') return;

    // Only works in text channels for now
    if (!(message.channel instanceof Discord.TextChannel)) return;
    // Doesn't respond to itself
    // if (message.member.user.id === client.user.id) return;

    var prefix = cached.prefixes.get(message.guild.id);
    if (!message.content.startsWith(prefix)) {
        // Ignores messages which don't start with the prefix or mention the bot
        if (!message.content.startsWith(client.user)) return;
        // Splits the message into command and commandArgs
        var messageWords = message.content.slice(client.user.toString().length).split(' ');
    } else {
        var messageWords = message.content.slice(prefix.length).split(' ');
    }
    
    var command;
    do {
        command = messageWords.shift().toLowerCase();;
    } while (!command && messageWords.length > 0)
    // var command = messageWords.shift().toLowerCase();
    var commandArgs = messageWords.join(' ');

    var member = await dbHelper.getMember(message.author.id, message.guild.id);
    var memberPerms = null;
    if (member) memberPerms = member.perms;

    // Special case for 'help' command
    if (command == 'help') {
        commands.help.handler(message, client, commandArgs, prefix, memberPerms, commands);
        return;
    }

    // Only calls a handler if that command exists
    if (commands[command]) {
        var permsNeeded = commands[command].getPermissions();
        if (permsNeeded >= 0) {
            if (!memberPerms) return message.channel.send(`**Use \`${prefix}register <name>\` to register with the bot and use this command!**`);
            if (!perms.all(permsNeeded, memberPerms)) {
                var missingPerms = perms.getPerms(permsNeeded & ~memberPerms);
                message.channel.send('**You don\'t have one or more required permissions to use this command!**');
                message.channel.send(`Missing permissions for \`${prefix}${command}\`: ${missingPerms.map(perm => perms.permText[perm]).join(', ')}`);
                return;
            }
        }

        var result = await commands[command].handler(message, client, commandArgs, prefix, memberPerms);
        if (!result) return;
        if (result.status == 'HELP') {
            commands.help.handler(message, client, command, prefix, memberPerms, commands);
        }

        // Admin commands are only usable by admins
        // if (commands[command].admin && message.author.id !== '554751081310060550') return message.channel.send(`**Sorry, this command is admin-only.**`);
        // var result = await commands[command].handler(message, client, commandArgs);
        // if (!result) return;
        // if (result.status == 'HELP') {
        //     commands.help.handler(message, client, command, commands);
        // }
    }
});