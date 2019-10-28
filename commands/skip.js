var queue = require('../musicqueue.js');

module.exports = require('../botcommand.js')('skip').setHandler(async (message, client, msgContents) => {
    if (!message.member.voice.channel) return message.channel.send('**Get into a voice channel!**');
    var serverQueue = queue.getQueue(message.guild.id);
    if (!serverQueue) return message.channel.send(`**Queue is empty right now. Use \`${process.env.PREFIX}play\` to play a song!**`);
    if (!serverQueue.connection) return message.channel.send('**Setting up connection, please wait.**');    

    var song = serverQueue.songs[0];
    message.channel.send(`**Skipping** \`${song.title}\``);
    queue.getDispatcher(message.guild.id).end();
}).setHelp({
    category: 'Music',
    text: 'Skip the currently playing song'
});