const prefix = process.env.PREFIX;

module.exports = require('../botcommand.js')('joke').setHandler((message, client, args) => {
    var channelId = message.channel.id;
    var userId = message.author.id;
    if (!data[channelId]) {
        data[channelId] = {};
    }
    if (data[channelId][userId]) {
        if (args == 'answer') {
            answerJoke(channelId, message.author);
            return;
        }
        message.channel.send(`**${message.author.username}**, you have a joke pending! Wait before asking for another one.`);
        return;
    }

    data[channelId][userId] = {};
    var chosenJoke = jokes[Math.floor(Math.random() * jokes.length)];
    data[channelId][userId].joke = chosenJoke;
    var seconds = -1;
    if (!isNaN(args)) {
        seconds = +args;
    }
    if (args == '') {
        seconds = -1;
    }
    var jokeText = `Here's a joke for **${message.author.username}**:\n\nQ: ${chosenJoke.q}\n\nA: Type \`${prefix}joke answer\` to see!`
    message.channel.send(jokeText)
    .then(msg => {
        data[channelId][userId].msg = msg;
        if (seconds >= 0) {
            setTimeout(answerJoke, (+args) * 1000, channelId, message.author)
        }
    });
}).setHelp({
    text: 'Tell a joke',
    syntax: '[seconds | \'answer\']',
    examples: [
        {
            syntax: '',
            result: `Tells a joke and reveals the answer when \`${prefix}joke answer\` is typed`
        },
        {
            syntax: '3',
            result: `Tells a joke and reveals the answer after 3 seconds, or when \`${prefix}joke answer\` is typed`
        },
        {
            syntax: 'answer',
            result: 'Reveals the answer to the previous joke'
        }
    ],
    notes: [
        'A user must wait until the answer of their previous joke is revealed before requesting a new one.',
        'Right now there are only two jokes, which isn\'t great.'
    ]
});

const jokes = [
    {
        q: 'What do you call two people with the same name?',
        a: 'Joe and John'
    },
    {
        q: 'Why is the Earth so hot?',
        a: 'A volcano is erupting in the Himalayas'
    }
];

const data = {};

function answerJoke(channelId, user) {
    var joke = data[channelId][user.id].joke;
    var msg = data[channelId][user.id].msg;
    // var user = client.fetchUser(userId);
    msg.edit(`Here's a joke for **${user.username}**:\n\nQ: ${joke.q}\n\nA: ${joke.a}`);
    data[channelId][user.id] = undefined;
}