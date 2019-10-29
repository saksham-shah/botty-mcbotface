var queue = require('../musicqueue.js');
var ytdl = require('ytdl-core');
var ytsr = require('ytsr');

module.exports = require('../botcommand.js')('play').setHandler(async (message, client, msgContents) => {
    
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.channel.send('**Get into a voice channel!**');

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('**error need more perms MORE PERMS**');
    }

    if (!msgContents) return message.channel.send('**You need to enter some text to search!**')
    
    console.log(`Searching YouTube: ${msgContents}`);
    message.channel.send(`**Searching YouTube for** \`${msgContents}\``);

    const filters = await ytsr.getFilters(msgContents).catch(console.log);
    const filter = filters.get('Type').find(f => f.name === 'Video');
    const options = {
        limit: 1,
        nextpageRef: filter.ref
    }
    const searchResults = await ytsr(null, options).catch((err) => {
        console.log(err);
        message.channel.send('**No results found**');
    });
    var song = null;
    if (searchResults.items.length > 0) {
        song = searchResults.items[0];
    }

    if (!song) {
        console.log('No results found');
        return message.channel.send('**No results found**');
    }

    console.log(`Found song: ${song.title}`);

    var serverQueue = queue.getQueue(message.guild.id);
    if (!serverQueue) {
        const thisQueue = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
            connection: null,
            volume: 1,
            loop: false,
			songs: []
        };
        queue.setQueue(message.guild.id, thisQueue);
        thisQueue.songs.push(song);
        try {
            console.log('Joining voice channel');
			var connection = await voiceChannel.join();
            thisQueue.connection = connection;
            console.log('Joined voice channel');
		} catch (err) {
            console.log(err);
            queue.deleteQueue(message.guild.id);
			return message.channel.send(err);
        }
        queue.playSong(message.guild.id, message.channel);
    } else {
        serverQueue.songs.push(song);
        console.log('Song already playing, adding to queue');
        message.channel.send(queue.songInfoEmbed(song).setTitle(`Adding to the queue`));
    }
}).setHelp({
    category: 'Music',
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