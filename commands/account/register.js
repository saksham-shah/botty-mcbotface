var Discord = require('discord.js');
const dbHelper = require('../../database.js');
var db = dbHelper.getDB();

module.exports = require('../../botcommand.js')('register').setHandler(async (message, client, msgContents, prefix) => {
    var collection = db.collection('users');

    var result = await collection.findOne({ userId: message.author.id });
    if (result) return message.channel.send('**You already have an account!**');
    
    var name = msgContents || message.author.username;
    if (name.length > 15) return message.channel.send(`**Your username can be a maximum of 15 characters! You can set a name using \`${prefix}register <name>\`**`);
    var validChars = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890 ';
    for (var letter of name) {
        if (!validChars.includes(letter)) {
            console.log(`Invalid username character: ${letter}`);
            return message.channel.send(`**Your username can only have alphanumeric characters! You can set a name using \`${prefix}register <name>\`**`);
        }
    }
    var user = {
        userId: message.author.id,
        name: name
    }
    collection.insertOne(user);
    return message.channel.send(`**${name}, you have been registered with this bot!**`);
    
}).setHelp({
    category: 'Account',
    important: false,
    text: 'Sign up for a Botty McBotface account',
    syntax: '[name]',
    examples: [
        {
            syntax: '',
            result: 'Creates an account using the user\'s Discord username as the name'
        },
        {
            syntax: 'Botty McBotface',
            result: 'Creates an account with the name `Botty McBotface`'
        }
    ]
});