var db = require('../../database.js').getDB();

module.exports = require('../../botcommand.js')('data').setHandler(async (message, client, msgContents) => {
    if (!msgContents) return;
    var collection = db.collection(msgContents);
    var data = await collection.find({}).toArray();
    console.log(data);
    if (data.length > 0) {
        return message.channel.send(data.toString());
    }
    return message.channel.send('**There is no data stored yet!**');
}).setPermissions('ADMIN');