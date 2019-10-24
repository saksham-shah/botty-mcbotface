var queue = require('../musicqueue.js');
var ytdl = require('ytdl-core');
var ytsr = require('ytsr');

module.exports = require('../botcommand.js')('play').setHandler(async (message, client, msgContents) => {
    
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.channel.send('Get into a voice channel!');

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('error need more perms MORE PERMS');
    }

    if (!msgContents) return message.channel.send('You need to enter some text to search.')
    
    const searchResults = await ytsr(msgContents).catch(console.log);
    var song = null;
    var count = 0;
    while (!song && count < 5) {
        song = searchResults.items[count].type == 'video' ? searchResults.items[count] : null;
        count++;
    }
    // const song = searchResults.items[0];
    if (!song) return message.channel.send('You did something wrong there, not me.');

    var serverQueue = queue.getQueue(message.guild.id);
    if (!serverQueue) {
        const thisQueue = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 1,
			playing: true,
        };
        queue.setQueue(message.guild.id, thisQueue);
        thisQueue.songs.push(song);
        try {
			var connection = await voiceChannel.join();
            thisQueue.connection = connection;
		} catch (err) {
            console.log(err);
            queue.deleteQueue(message.guild.id);
			return message.channel.send(err);
        }
        queue.playSong(message.guild.id, message.channel);
    } else {
        serverQueue.songs.push(song);
        message.channel.send(`Adding to queue: ${song.title}`);
    }
}).setHelp({
    text: 'Adds a song to the queue',
    syntax: 'search | URL',
    examples: [
        {
            syntax: 'two drums and a cymbal',
            result: 'Adds the great Tom Scott video'
        },
        {
            syntax: 'https://www.youtube.com/watch?v=8eXj97stbG8',
            result: 'Also adds the great Tom Scott video'
        }
    ],
    notes: [
        'No key required (unlike You Fool)',
        'The URL doesn\'t 100% work. But search is good so use that.'
    ]
});