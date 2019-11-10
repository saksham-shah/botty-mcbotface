const fs = require('fs');

const Discord = require('discord.js');
const prefix = process.env.PREFIX;

var commands = {};

// Goes through all of the commands in the 'commands' folder and adds it to the object
checkDirectory('');

// console.log(fs.lstatSync('./commands/help.js').isDirectory());
// fs.readdir('./commands/', (err, files) => {
//     files.forEach(file => {
//         require(`../commands/${file}`).addToDict(commands);
//     })
// })

async function checkDirectory(path) {
    fs.readdir(`./commands/${path}`, (err, contents) => {
        contents.forEach((pathName) => {
            var pathObj = fs.lstatSync(`./commands/${path}/${pathName}`);
            if (pathObj.isDirectory()) {
                checkDirectory(pathName);
            } else {
                var command = require(`../commands/${path}/${pathName}`);
                if (!command.disabled) {
                    command.addToDict(commands);
                }
            }
        });
    });
}

module.exports = require('../botevent.js')('message').setHandler((client, message) => {
    // Special development channel
    if (process.env.STATUS === 'dev' && message.channel.id !== '638667677577248768') return;
    if (process.env.STATUS === 'prod' && message.channel.id === '638667677577248768') return;
    
    // Only works in text channels for now
    if (!(message.channel instanceof Discord.TextChannel)) return;
    // Doesn't respond to itself
    if (message.member.user.id === client.user.id) return;
    // Ignores messages which don't start with the prefix
    if (!message.content.startsWith(prefix)) return;

    // Splits the message into command and commandArgs
    var messageWords = message.content.slice(prefix.length).split(' ');
    var command = messageWords.shift().toLowerCase();
    var commandArgs = messageWords.join(' ');

    // Special case for 'help' command
    if (command == 'help') {
        commands.help.handler(message, client, commandArgs, commands);
        return;
    }

    // Only calls a handler if that command exists
    if (commands[command]) {
        // Admin commands are only usable by admins
        if (commands[command].admin && message.author.id !== '554751081310060550') return message.channel.send(`**Sorry, this command is admin-only.**`);
        commands[command].handler(message, client, commandArgs);
    }
});