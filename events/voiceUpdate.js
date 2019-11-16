var queue = require('../musicqueue.js');

module.exports = require('../botevent.js')('voiceStateUpdate').setHandler((client, oldVoice, newVoice) => {
    if (!newVoice.channel) {
        if (newVoice.member.user.id === client.user.id) {
            queue.deleteQueue(newVoice.guild.id);
        } else if (oldVoice.channel.members.size < 2) {
            queue.deleteQueue(newVoice.guild.id);
            oldVoice.channel.leave();
        }
    }
}); 