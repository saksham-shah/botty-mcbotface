var Discord = require('discord.js');
var db = require('../../database.js').getDB();

module.exports = require('../../botcommand.js')('allnotes').setHandler(async (message, client, msgContents) => {
    var collection = db.collection('notes');

    var notes = await collection.find({ server: message.guild.id }).toArray();

    var noteEmbed = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle(`Notes in ${message.guild.name}`);

    var notesText = ``;
    for (var note of notes) {
        notesText += `\`${note.name}\` - ${note.editedBy || note.createdBy}\n`
    }
    if (!notesText) {
        notesText = 'No notes in this server yet';
    }

    noteEmbed.setFooter(`${notes.length} note${notes.length == 1 ? '' : 's'}`);
    noteEmbed.setDescription(notesText);

    return message.channel.send(noteEmbed);
    
}).setPermissions('SERVER').setAliases('alltags').setHelp({
    category: 'Admin',
    important: false,
    text: 'Shows you all of the notes in this server'
});