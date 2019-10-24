// Look at this super efficient code wow
const prefix = require('../botconfig.js').PREFIX;

module.exports = require('../botevent.js')('ready').setHandler(client => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`${prefix}help`);
});