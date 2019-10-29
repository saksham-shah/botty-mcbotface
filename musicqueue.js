var queues = new Map();
var ytdl = require('ytdl-core');
var Discord = require('discord.js');

module.exports = {
    setQueue: (guildId, queueObj) => {
        return queues.set(guildId, queueObj);
    },
    getQueue: guildId => {
        return queues.get(guildId);
    },
    deleteQueue: guildId => {
        return queues.delete(guildId);
    },
    playSong: playNextSong,
    getDispatcher: getDispatcher,
    songInfoEmbed: songInfoEmbed
}

function playNextSong(guildId, channel) {
    const serverQueue = queues.get(guildId);
    if (!serverQueue) return;
    if (serverQueue.songs.length == 0) {
        console.log('Queue empty, leaving voice channel');
        serverQueue.voiceChannel.leave();
        queues.delete(guildId);
        return;
    }

    const song = serverQueue.songs[0];
    if (!serverQueue.loop) {
        console.log(`Now playing: ${song.title}`);
        channel.send(songInfoEmbed(song).setTitle('Now playing'));
    }

    serverQueue.connection.play(ytdl(song.link, { filter: 'audioonly' }))
    .on('end', () => {
        console.log('Song ended');
        if (!serverQueue.loop) {
            serverQueue.songs.shift();
            console.log('Playing next song');
        }
        playNextSong(guildId, channel);
    })
    .on('error', console.log)
    .setVolumeLogarithmic(serverQueue.volume);
}

function getDispatcher(guildId) {
    var serverQueue = queues.get(guildId);
    return serverQueue.connection.dispatcher;
}

function songInfoEmbed(song) {
    var songEmbed = new Discord.MessageEmbed()
    .setColor('RED')
    .setFooter(`Type '${process.env.PREFIX}play <search phrase>' to play audio from YouTube`)
    .setDescription(`**${song.title}**`)
    .setThumbnail(song.thumbnail)
    .addField('More information', `By: ${song.author.name}\nUploaded: ${song.uploaded_at}\nDuration: ${song.duration}\nViews: ${song.views}`);
    return songEmbed;
}