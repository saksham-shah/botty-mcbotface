var dbHelper = require('../database.js');
var db = dbHelper.getDB();
var cached = dbHelper.getCached();
var perms = require('../permissions.js');

// Look at this super efficient code wow
module.exports = require('../botevent.js')('ready').setHandler(async client => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`${process.env.PREFIX}help`);

    var collection = db.collection('servers');
    for (var [id, guild] of client.guilds) {
        if (!guild.available) continue;

        var result = await collection.findOne({ serverId: id });
        if (!result) {
            var serverObj = {
                serverId: id,
                prefix: '?',
                defaultPerms: perms.getPermNum('NOTES', 'MUSIC')
            }
            collection.insertOne(serverObj);
            var prefix = serverObj.prefix;
        }
        cached.prefixes.set(id, prefix || result.prefix);
    }
});