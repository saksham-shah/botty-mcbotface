module.exports = require('../botcommand.js')('updated').setHandler((message, client, msgContents) => {
    // Replies 'Pong!' followed by echoing what the user typed
    message.channel.send(`Last updated: ${lastUpdated}`);
}).setHelp({
    text: 'Check when the bot was last updated'
});

const lastUpdated = '9pm 19 march. this is hard coded into the program which is a terrible idea but eh.'