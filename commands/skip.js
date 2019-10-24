const prefix = require('../botconfig.js').PREFIX;
var queue = require('../musicqueue.js');

module.exports = require('../botcommand.js')('skip').setHandler(async (message, client, msgContents) => {
    
    if (!message.member.voiceChannel) return message.channel.send('Get into a voice channel!');
    var serverQueue = queue.getQueue(message.guild.id);
    if (!serverQueue) return message.channel.send(`Queue is empty right now. Use \`${prefix}play\` to play a song!`);
    
    var song = serverQueue.songs[0];
    message.channel.send(`Skipping: ${song.title}`);
    queue.getDispatcher(message.guild.id).end();
}).setHelp({
    text: 'Skip the currently playing song',
    syntax: ''
});