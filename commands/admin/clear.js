var db = require('../../database.js').getDB();

module.exports = require('../../botcommand.js')('clear').setHandler(async (message, client, msgContents) => {
    if (!msgContents) return;
    for (var collection of msgContents.split(' ')) {
        await db.dropCollection(collection).then(() => console.log(`Cleared ${collection}`));
    }
    
}).setPermissions('ADMIN');