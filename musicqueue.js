var queues = new Map();
var ytdl = require('ytdl-core');

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
    playSong: (guildId, channel) => {
        return playNextSong(guildId, channel);
    },
    getDispatcher: (guildId) => {
        return getDispatcher(guildId);
    }
}

function playNextSong(guildId, channel) {
    const serverQueue = queues.get(guildId);
    if (!serverQueue) return;
    if (serverQueue.songs.length == 0) {
        serverQueue.voiceChannel.leave();
        queues.delete(guildId);
        return;
    }

    const song = serverQueue.songs[0];
    channel.send(`Now playing: ${song.title}`)

    const dispatcher = serverQueue.connection.playStream(ytdl(song.link))
    .on('end', () => {
        serverQueue.songs.shift();
        playNextSong(guildId, channel);
    })
    .on('error', console.log);

    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

function getDispatcher(guildId) {
    var serverQueue = queues.get(guildId);
    return serverQueue.connection.dispatcher;
}

function endCurrentSong(guildId, channel, endAll) {
    var serverQueue = queues.get(guildId);
    if (endAll) {
        serverQueue.songs = [];
    }
    serverQueue.connection.dispatcher.end();
}