const dbHelper = require('../../database.js');
var db = dbHelper.getDB();
var cached = dbHelper.getCached();

module.exports = require('../../botcommand.js')('setprefix').setHandler((message, client, newPrefix) => {
    var collection = db.collection('servers');
    if (!newPrefix) return { status: 'HELP' };

    var update = { $set: {
        prefix: newPrefix
    }};

    collection.updateOne({ serverId: message.guild.id }, update);
    cached.prefixes.set(message.guild.id, newPrefix);

    message.channel.send(`**My prefix for this server, \`${message.guild.name}\`, has now been set to \`${newPrefix}\`!**`);
}).setPermissions('SERVER').setHelp({
    category: 'Server',
    text: 'Updates the prefix for this server',
    syntax: 'prefix'
});