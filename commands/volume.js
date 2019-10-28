var queue = require('../musicqueue.js');

module.exports = require('../botcommand.js')('volume').setHandler((message, client, volume) => {
    if (!message.member.voice.channel) return message.channel.send('**Get into a voice channel!**');
    var serverQueue = queue.getQueue(message.guild.id);
    if (!serverQueue) return message.channel.send(`**Queue is empty right now. Use \`${process.env.PREFIX}play\` to play a song!**`);
    if (!serverQueue.connection) return message.channel.send('**Setting up connection, please wait.**');    

    var dispatcher = queue.getDispatcher(message.guild.id);

    if (!isNaN(volume) && volume) {
        if (volume > 3 || volume < 0) return message.channel.send('**Volume is outside the accepted range (0 to 3).**')
        volume = Math.floor(volume * 10) * 0.1;
        dispatcher.setVolumeLogarithmic(volume);
        return message.channel.send(`**Setting volume to** \`${volume}\``);
    }
    message.channel.send(`**Current volume:** \`${dispatcher.volumeLogarithmic}\``);
}).setHelp({
    category: 'Music',
    important: false,
    text: 'Change the volume of music, or check what the volume currently is',
    syntax: '[volume]',
    examples: [
        {
            syntax: '',
            result: 'Tells you the current volume'
        },
        {
            syntax: '0.5',
            result: 'Sets the volume to 0.5'
        }
    ]
});