// Look at this super efficient code wow
module.exports = require('../botevent.js')('ready').setHandler(client => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`${process.env.PREFIX}help`);
});