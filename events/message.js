const fs = require('fs');

const Discord = require('discord.js');
// const prefix = process.env.PREFIX;

const dbHelper = require('../database.js');
var cached = dbHelper.getCached();

const perms = require('../permissions.js');

var commands = new Map();

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
                    command.addToMap(commands);
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
    
    var commandWord;
    do {
        commandWord = messageWords.shift().toLowerCase();;
    } while (!commandWord && messageWords.length > 0)
    var commandArgs = messageWords.join(' ');

    var member = await dbHelper.getMember(message.author.id, message.guild.id);
    var memberPerms = null;
    if (member) memberPerms = member.perms;

    var command = commands.get(commandWord) || Array.from(commands.values()).find(cmd => cmd.aliases.includes(commandWord));
    if (!command) return;

    // Only calls a handler if that command exists
    // if (commands[command]) {
    var cooldown = command.checkCooldown(message.author.id);
    if (cooldown > 0) return message.channel.send(`**Please wait ${cooldown.toFixed(1)} seconds before reusing the \`${commandWord}\` command!**`);

    // Special case for 'help' command
    if (commandWord == 'help') {
        command.handler(message, client, commandArgs, prefix, memberPerms, commands);
        return;
    }

    var permsNeeded = command.permissions;
    if (permsNeeded >= 0) {
        if (!memberPerms) return message.channel.send(`**Use \`${prefix}register <name>\` to register with the bot and use this command!**`);
        if (!perms.all(permsNeeded, memberPerms)) {
            var missingPerms = perms.getPerms(permsNeeded & ~memberPerms);
            message.channel.send('**You don\'t have one or more required permissions to use this command!**');
            message.channel.send(`Missing permissions for \`${prefix}${commandWord}\`: ${missingPerms.map(perm => perms.permText[perm]).join(', ')}`);
            return;
        }
    }

    var result = await command.handler(message, client, commandArgs, prefix, memberPerms);
    if (result) {
        if (result.status == 'HELP') {
            return commands.get('help').handler(message, client, commandWord, prefix, memberPerms, commands);
        }
    }
    command.setUserCooldown(message.author.id);
    // }
});