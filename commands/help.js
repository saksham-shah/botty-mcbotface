var Discord = require('discord.js');

const perms = require('../permissions.js');

module.exports = require('../botcommand.js')('help').setHandler((message, client, input, prefix, memberPerms, commands) => {
    // quick easter egg
    if (input === 'help help help help help') {
        const attachment = new Discord.MessageAttachment('https://www.thorntons.co.uk/on/demandware.static/-/Sites-thorntons-live-products/default/dw8b4656bb/product-images/2019-2020/Spring-S2/New-Easter-Images/77180596-Bunny-Milk-Egg.jpg');
        return message.channel.send(attachment);
    }
    
    // Uses a rich embed to send help instructions
    var helpEmbed = new Discord.MessageEmbed()
    .setColor('RED')
    .setAuthor(`${client.user.username} Help Manual`, client.user.avatarURL())
    .setFooter(`Type \'${prefix}help <command>\' for more info on a command or \'${prefix}help <category>\' for more info on a category`)
    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Pictogram_voting_question.svg/220px-Pictogram_voting_question.svg.png');

    if (!memberPerms) helpEmbed.addField('**NOTE:** You haven\'t made an account here yet...', `Use \`${prefix}register <name>\` to create an account and unlock more commands!`);

    // If the user has requested help for a specific command (which exists)
    if (commands[input.toLowerCase()]) {
        var commandName = input.toLowerCase();
        var help = commands[commandName].getHelp();
        // Only displays help text if there is any
        if (help) {
            // Displays the command syntax
            helpEmbed.setTitle(`\`Syntax: ${prefix}${commandName}${help.syntax ? ' ' : ''}${help.syntax}\``);
            
            // Some commands have text describing what they do
            if (help.text) {
                helpEmbed.setDescription(help.text);
            }

            // Some commands have examples of usage which can be displayed
            if (help.examples) {
                var examplesText = ``;
                for (var example of help.examples) {
                    // If there is no syntax, there has been an error and the example should not be displayed
                    if (example.syntax == undefined) continue;
                    // Displays the example syntax
                    examplesText += `\`${prefix}${commandName}${example.syntax ? ' ' : ''}${example.syntax}\``;
                    // Explains the result (if any)
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

            return message.channel.send(helpEmbed);
        }
    }

    // If the user has requested for help without typing a specific command
    var categories = {};
    for (var command in commands) {
        var help = commands[command].getHelp();
        // Only shows commands which have a help object
        if (!help) continue;
        // Only shows commands which the user can use
        var permsNeeded = commands[command].getPermissions();
        if (permsNeeded >= 0 && !perms.all(permsNeeded, memberPerms)) continue;
        // Splits the commands into their categories
        var category = help.category.toLowerCase();
        // Initialise an array for a category if it hasn't been done yet
        if (!categories[category]) {
            categories[category] = {
                name: help.category,
                commands: []
            };
        }
        // Add the command to the respective category
        categories[category].commands.push(commands[command]);
    }

    // If the user has requested for help for specific category
    if (categories[input.toLowerCase()]) {
        var categoryName = input.toLowerCase();
        var commandsText = ``;
        for (var command of categories[categoryName].commands) {
            commandsText += helpText(command, prefix);
        }
        helpEmbed.addField(`**${categories[categoryName].name}**`, commandsText);
        return message.channel.send(helpEmbed);
    }

    for (category in categories) {
        var commandsText = ``;
        for (var command of categories[category].commands) {
            // Some commands are not important enough to be shown in the main help message
            if (!command.getHelp().important) continue;
            commandsText += helpText(command, prefix);
        }
        if (commandsText) {
            helpEmbed.addField(`**${categories[category].name}**`, commandsText);
        }
    }
    helpEmbed.setDescription(`Hi **${message.author.username}**, I'm ${client.user.username}!`);

    message.channel.send(helpEmbed);
}).setHelp({
    category: 'help',
    important: false,
    text: 'wow an easter egg',
    syntax: 'help help help help help',
    notes: [
        'I bet you weren\'t expecting that'
    ]
});

// Generates the line of help text for a command
function helpText(command, prefix) {
    var name = command.getName();
    var help = command.getHelp();
    var txt = '';
    if (help.text) {
        txt = ` - ${help.text}`;
    }
    return `\`${prefix}${name}\`${txt}\n`;
}