var db = require('../../database.js').getDB();

module.exports = require('../../botcommand.js')('data').setHandler(async (message, client, msgContents) => {
    var collection = db.collection('test');
    if (!msgContents) {
        // var data = await collection.find({}, { projection: { _id: 0 } }).toArray();
        var data = await collection.find({}).toArray();
        console.log(data);
        if (data.length > 0) {
            return message.channel.send(data.toString());
        }
        return message.channel.send('**There is no data stored yet!**');
    }

    var document = {
        name: msgContents,
        userID: message.author.id,
        channelID: message.channel.id
    }
    await collection.insertOne(document);
    console.log(`Inserted: ${msgContents}`);
    message.channel.send(`Inserted: ${msgContents}`);
}).adminOnly().disable();