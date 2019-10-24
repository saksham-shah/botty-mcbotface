var Discord = require('discord.js');
const prefix = require('../botconfig.js').PREFIX;

module.exports = require('../botcommand.js')('help').setHandler((message, client, commandName, commands) => {
    // Uses a rich embed to send help instructions
    var helpEmbed = new Discord.RichEmbed()
    .setColor('RED')
    .setAuthor(`${client.user.username} Help Manual`, client.user.avatarURL)
    .setFooter(`Type \'${prefix}help <command>\' for more info on a command.`)
    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Pictogram_voting_question.svg/220px-Pictogram_voting_question.svg.png');

    // If the user has requested help for a specific command (which exists)
    if (commands[commandName]) {
        var help = commands[commandName].getHelp();
        // Only displays help text if there is any
        if (help) {
            if (help.syntax !== null) {
                var text = help.text;
                helpEmbed.setTitle(`\`Syntax: ${prefix}${commandName}${help.syntax ? ' ' : ''}${help.syntax}\``)
                .setDescription(text);

                // Some commands have examples of usage which can be displayed
                if (help.examples) {
                    var examplesText = ``;
                    for (var example of help.examples) {
                        if (example.syntax == undefined) continue;
                        examplesText += `\`${prefix}${commandName}${example.syntax ? ' ' : ''}${example.syntax}\``;
                        if (example.result) {
                            examplesText +=  ` - ${example.result}`
                        }
                        examplesText += `\n`;
                    }
                    helpEmbed.addField('**Examples:**', examplesText);
                }

                // Some commands have extra notes
                if (help.notes) {
                    var notesText = ``;
                    for (var note of help.notes) {
                        notesText += `${note}\n`;
                    }
                    helpEmbed.addField('**Notes:**', notesText);
                }
            } else {
                helpEmbed.setTitle(`Unfortunately, there are no further instructions on the usage of \`${prefix}${commandName}\``);
            }

            message.channel.send(helpEmbed);
            return;
        }
    }

    // If the user has requested for help without typing a specific command
    var commandsText = ``;
    for (var command in commands) {
        var name = commands[command].getName();
        var help = commands[command].getHelp();
        // Displays all commands which have help text
        if (!help) continue;

        if (help.text) {
            help = help.text;
        }

        commandsText += `\`${prefix}${name}\` - ${help}\n`;
    }

    helpEmbed.setDescription(`Hi **${message.author.username}**, I'm ${client.user.username}!`)
    .addField('Here are the commands you can use:', commandsText);

    message.channel.send(helpEmbed);
});