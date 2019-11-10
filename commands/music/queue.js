var queue = require('../../musicqueue.js');
var Discord = require('discord.js');

module.exports = require('../../botcommand.js')('queue').setHandler((message, client, volume) => {
    var serverQueue = queue.getQueue(message.guild.id);
    if (!serverQueue) return message.channel.send(`**The queue is empty right now. Use \`${process.env.PREFIX}play\` to play a song!**`);
    var songs = serverQueue.songs;
    var queueEmbed = new Discord.MessageEmbed()
    .setColor('RED')
    .setFooter(`Type '${process.env.PREFIX}skip' to skip the current video`)
    .setTitle('Now playing')
    .setDescription(`**${songs[0].title}**`)
    .setThumbnail(songs[0].thumbnail);

    var queueText = ``;
    for (var i = 1; i < songs.length; i++) {
        queueText += `#${i}: ${songs[i].title}\n`;
    }
    if (!queueText) {
        queueText = 'Nothing yet';
    }
    queueEmbed.addField('Up next', queueText);

    message.channel.send(queueEmbed);
}).setHelp({
    category: 'Music',
    important: false,
    text: 'See what videos are in the queue'
});