module.exports = require('../botcommand.js')('ping').setHandler((message, client, msgContents) => {
    // Replies 'Pong!' followed by echoing what the user typed
    message.channel.send(`**Pong!** ${msgContents}`);
}).setHelp({
    text: 'Check if the bot is active',
    syntax: '[msg]',
    examples: [
        {
            syntax: '',
            result: 'Replies \'Pong!\''
        },
        {
            syntax: 'hello',
            result: 'Replies \'Pong! hello\''
        }
    ]
});