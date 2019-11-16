const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = require('../botcommand.js')('joke').setHandler(async (message, client, msgContents, prefix) => {
    var channelId = message.channel.id;
    var userId = message.author.id;
    if (!data[channelId]) {
        data[channelId] = {};
    }
    if (data[channelId][userId]) {
        if (msgContents == 'reveal') {
            revealJoke(channelId, message.member);
            return;
        }
        message.channel.send(`**${message.member.nickname || message.author.username}**, you have a joke pending! Wait before asking for another one.`);
        return;
    }

    data[channelId][userId] = {};
    var response = await fetch('https://official-joke-api.appspot.com/jokes/random').catch(console.log);
    var chosenJoke = await response.json();
    data[channelId][userId].joke = chosenJoke;
    var seconds = -1;
    if (!isNaN(msgContents)) {
        seconds = +msgContents;
    }
    if (msgContents == '') {
        seconds = -1;
    }
    message.channel.send(jokeEmbed(chosenJoke, message.member, false))
    .then(msg => {
        data[channelId][userId].msg = msg;
        if (seconds >= 0) {
            setTimeout(revealJoke, (+msgContents) * 1000, channelId, message.member)
        }
    });
}).setHelp({
    text: 'Tell a joke',
    syntax: '[seconds | \'reveal\']',
    examples: [
        {
            syntax: '',
            result: `Tells a joke and reveals the punchline when \`joke reveal\` is typed`
        },
        {
            syntax: '3',
            result: `Tells a joke and reveals the punchline after 3 seconds, or when \`joke reveal\` is typed`
        },
        {
            syntax: 'reveal',
            result: 'Reveals the punchline to the previous joke'
        }
    ],
    notes: [
        'A user must wait until the punchline of their previous joke is revealed before requesting a new one.',
        'The jokes are from `https://official-joke-api.appspot.com/jokes/random`'
    ]
});

const data = {};

function revealJoke(channelId, member) {
    var joke = data[channelId][member.user.id].joke;
    var msg = data[channelId][member.user.id].msg;
    msg.edit(jokeEmbed(joke, member, true));
    data[channelId][member.user.id] = undefined;
}

function jokeEmbed(joke, member, reveal) {
    var embed = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle(`Here's a joke for **${member.nickname || member.user.username}**`)
    .setFooter('Jokes brought to you by official-joke-api.appshot.com')
    .setThumbnail(member.user.avatarURL());
    if (reveal) {
        embed.addField(joke.setup, joke.punchline);
        return embed;
    }
    embed.addField(joke.setup, `Type \`${prefix}joke reveal\` to see the rest!`);
    return embed;
}