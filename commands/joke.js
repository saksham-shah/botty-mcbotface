const prefix = process.env.PREFIX;
const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = require('../botcommand.js')('joke').setHandler(async (message, client, args) => {
    var channelId = message.channel.id;
    var userId = message.author.id;
    if (!data[channelId]) {
        data[channelId] = {};
    }
    if (data[channelId][userId]) {
        if (args == 'reveal') {
            revealJoke(channelId, message.author);
            return;
        }
        message.channel.send(`**${message.author.username}**, you have a joke pending! Wait before asking for another one.`);
        return;
    }

    data[channelId][userId] = {};
    var response = await fetch('https://official-joke-api.appspot.com/jokes/random').catch(console.log);
    var chosenJoke = await response.json();
    data[channelId][userId].joke = chosenJoke;
    var seconds = -1;
    if (!isNaN(args)) {
        seconds = +args;
    }
    if (args == '') {
        seconds = -1;
    }
    // var jokeText = `Here's a joke for **${message.author.username}**:\n\n${chosenJoke.setup}\n\nType \`${prefix}joke reveal\` to see the rest!`
    message.channel.send(jokeEmbed(chosenJoke, message.author, false))
    .then(msg => {
        data[channelId][userId].msg = msg;
        if (seconds >= 0) {
            setTimeout(revealJoke, (+args) * 1000, channelId, message.author)
        }
    });
}).setHelp({
    text: 'Tell a joke',
    syntax: '[seconds | \'reveal\']',
    examples: [
        {
            syntax: '',
            result: `Tells a joke and reveals the punchline when \`${prefix}joke reveal\` is typed`
        },
        {
            syntax: '3',
            result: `Tells a joke and reveals the punchline after 3 seconds, or when \`${prefix}joke reveal\` is typed`
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

function revealJoke(channelId, user) {
    var joke = data[channelId][user.id].joke;
    var msg = data[channelId][user.id].msg;
    msg.edit(jokeEmbed(joke, user, true));
    data[channelId][user.id] = undefined;
}

function jokeEmbed(joke, user, reveal) {
    var embed = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle(`Here's a joke for **${user.username}**`)
    .setFooter('Jokes brought to you by official-joke-api.appshot.com')
    .setThumbnail(user.avatarURL());
    if (reveal) {
        embed.addField(joke.setup, joke.punchline);
        return embed;
    }
    embed.addField(joke.setup, `Type \`${prefix}joke reveal\` to see the rest!`);
    return embed;
}