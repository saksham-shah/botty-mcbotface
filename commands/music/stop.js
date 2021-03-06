var queue = require('../../musicqueue.js');

module.exports = require('../../botcommand.js')('stop').setHandler(async (message, client, msgContents, prefix) => {
    if (!message.member.voice.channel) return message.channel.send('**Get into a voice channel!**');
    var serverQueue = queue.getQueue(message.guild.id);
    if (!serverQueue) return message.channel.send(`**Nothing is playing right now. Use \`${prefix}play\` to play a song!**`);
    if (!serverQueue.connection) return message.channel.send('**Setting up connection, please wait.**');    

    message.channel.send(`**Stopping all songs**`);
    serverQueue.songs = [];
    queue.getDispatcher(message.guild.id).end();
}).setPermissions('MUSIC').setHelp({
    category: 'Music',
    text: 'Stop playing songs'
});