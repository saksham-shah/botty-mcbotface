console.log("Program started");

require('dotenv').config();

const fs = require('fs');

const Discord = require('discord.js');
const client = new Discord.Client();

const token = process.env.BOT_TOKEN;

require('./database.js').init().then(() => {
    // Creates event listeners for each event in the 'events' folder
    fs.readdir('./events/', (err, files) => {
        files.forEach(file => {
            require(`./events/${file}`).attachToClient(client);
        })
    })

    client.login(token);
});