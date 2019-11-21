var queue = require('../../musicqueue.js');

module.exports = require('../../botcommand.js')('loop').setHandler(async (message, client, msgContents, prefix) => {
    if (!message.member.voice.channel) return message.channel.send('**Get into a voice channel!**');
    var serverQueue = queue.getQueue(message.guild.id);
    if (!serverQueue) return message.channel.send(`**Nothing is playing right now. Use \`${prefix}play\` to play a song!**`);
    if (!serverQueue.connection) return message.channel.send('**Setting up connection, please wait.**');    

    var queueObj = queue.getQueue(message.guild.id);
    if (queueObj.loop = !queueObj.loop) return message.channel.send('**Loop enabled**');
    return message.channel.send('**Loop disabled**');
}).setPermissions('MUSIC').setAliases('l').setHelp({
    category: 'Music',
    important: false,
    text: 'Loop the currently playing song'
});