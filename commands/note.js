var Discord = require('discord.js');
var db = require('../database.js').getDB();
const perms = require('../permissions.js');

module.exports = require('../botcommand.js')('note').setHandler(async (message, client, msgContents, memberPerms, prefix) => {
    var collection = db.collection('notes');
    if (!msgContents) return { status: 'HELP' };

    var spaceSplit = msgContents.split(' ');
    var command = spaceSplit[0].toLowerCase();
    var noteName = command;

    if (command == 'create' || command == 'edit' || command == 'delete') {
        if (!perms.getPerms(memberPerms).includes('NOTES')) return message.channel.send(`**You need the \`Manage notes\` permission to ${command} notes!**`);
        spaceSplit.shift();
        if (spaceSplit.length == 0) return message.channel.send(`**You must type the name of the note you want to ${command}!**`);
        noteName = spaceSplit.shift().toLowerCase();
    }
    var noteFound = await collection.findOne({ name: noteName, server: message.guild.id });

    switch(command) {
        case 'create':
            if (spaceSplit.length == 0) return message.channel.send(`**You must type some text to store in \`${noteName}\`!**`);
            if (noteFound) return message.channel.send(`**\`${noteName}\` already exists. Use \`${prefix}note edit ${noteName}\` to edit it!**`);
            var note = {
                name: noteName,
                contents: spaceSplit.join(' '),
                server: message.guild.id,
                createdBy: message.member.nickname || message.author.username,
                editedBy: null
            };
            collection.insertOne(note);
            return message.channel.send(`**Created note \`${noteName}\`!**`);
        case 'edit':
            if (spaceSplit.length == 0) return message.channel.send(`**You must type some text to edit \`${noteName}\`!**`);
            if (!noteFound) return message.channel.send(`**\`${noteName}\` does not exist. Use \`${prefix}note create ${noteName}\` to create it!**`);
            var update = { $set: {
                contents: spaceSplit.join(' '),
                editedBy: message.member.nickname || message.author.username
            }};
            collection.updateOne({ name: noteName, server: message.guild.id }, update);
            return message.channel.send(`**Edited note \`${noteName}\`!**`);
        case 'delete':
            if (!noteFound) return message.channel.send(`**\`${noteName}\` does not exist. Use \`${prefix}note create ${noteName}\` to create it!**`);
            collection.deleteOne({ name: noteName, server: message.guild.id });
            return message.channel.send(`**Deleted note \`${noteName}\`!**`);
        default:
            if (!noteFound) return message.channel.send(`**\`${noteName}\` does not exist. Use \`${prefix}note create ${noteName}\` to create it!**`);
            // var note = noteFound[0];

            var noteEmbed = new Discord.MessageEmbed()
            .setColor('RED')
            .setAuthor(`Note created by ${noteFound.createdBy}`)
            .setTitle(noteFound.name)
            .setDescription(noteFound.contents);

            if (noteFound.editedBy) {
                noteEmbed.setFooter(`Last edited by ${noteFound.editedBy}`);
            }
            return message.channel.send(noteEmbed);
    }
    
}).setHelp({
    text: 'Creates, edits and views notes',
    syntax: '[\'create\' | \'edit\' | \'delete\'] noteName [content]',
    examples: [
        {
            syntax: 'create hello Hello and welcome to this server!',
            result: 'Stores `Hello and welcome to this server!` in the note `hello`'
        },
        {
            syntax: 'edit hello Oh hi there',
            result: 'Edits the note `hello` to `Oh hi there`'
        },
        {
            syntax: 'delete hello',
            result: 'Deletes the note `hello`'
        },
        {
            syntax: 'hello',
            result: 'Shows the contents of the note `hello`'
        }
    ]
});