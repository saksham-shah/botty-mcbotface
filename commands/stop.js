var queue = require('../musicqueue.js');

module.exports = require('../botcommand.js')('stop').setHandler(async (message, client, msgContents) => {
    
    if (!message.member.voice.channel) return message.channel.send('Get into a voice channel!');
    var serverQueue = queue.getQueue(message.guild.id);
    if (!serverQueue) return message.channel.send(`Queue is empty right now. Use \`${process.env.PREFIX}play\` to play a song!`);
    
    message.channel.send(`Stopping all songs`);
    serverQueue.songs = [];
    queue.getDispatcher(message.guild.id).end();
}).setHelp({
    text: 'Stop playing songs',
    syntax: ''
});