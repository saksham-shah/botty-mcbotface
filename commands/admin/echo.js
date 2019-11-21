module.exports = require('../../botcommand.js')('echo').setHandler(async (message, client, msgContents) => {
    if (!msgContents) return;
    message.channel.send(msgContents);
    message.delete();
}).setPermissions('ADMIN').setAliases('repeat');