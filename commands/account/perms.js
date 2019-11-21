var Discord = require('discord.js');
var dbHelper = require('../../database.js');
var db = dbHelper.getDB();
var perms = require('../../permissions.js');

// Try and figure out what's going on I dare you
module.exports = require('../../botcommand.js')('permissions').setHandler(async (message, client, msgContents, prefix, memberPerms) => {
    var member = message.member;
    var self = true;
    if (message.mentions.members.size > 0) {
        var member = message.mentions.members.first();
        self = false;
    }
    var botUser = await dbHelper.getUser(member.user.id);
    if (!botUser) return message.channel.send(`**This user does not have an account here yet!**`);
    var botMember = await dbHelper.getMember(member.user.id, message.guild.id);

    var permsToUse = [];
    for (var perm in perms.permNums) {
        if (self || (memberPerms & perms.permNums[perm])) permsToUse.push(perm);
    }

    var embed = permsEmbed(botUser.name, message.member.nickname || message.author.username, message.guild.name, botMember.perms, permsToUse, member.user.avatarURL(), self);

    var spaceSplit = msgContents.split(' ');
    if (spaceSplit.length > 0) {
        if (spaceSplit[0] == 'change') {
            if (self) return message.channel.send(`**You can't give yourself permissions!**`);
            if (!(memberPerms & perms.permNums.SERVER)) return message.channel.send(`**You need the \`Server admin\` permission to change the permissions of a user!**`);
            if (!(memberPerms & perms.permNums.ADMIN) && botMember.perms & perms.permNums.SERVER) return message.channel.send(`**You need the \`Full admin\` permission to change the permissions of a server admin!**`);
            if (botMember.perms & perms.permNums.ADMIN) return message.channel.send(`**You cannot change the permissions of a full admin!**`);
        
            var newPerms = botMember.perms;

            embed.addField(`Currently editing permissions`, 'To toggle a permission, simply type the number of the permission you want to change. Type anything else to stop changing permissions.')
            var sentMessage = await message.channel.send(embed);

            var collectorFilter = m => m.member == message.member;
            var collector = message.channel.createMessageCollector(collectorFilter)
            .on('collect', msg => {
                var index = parseInt(msg.content);
                if (isNaN(index) || index <= 0 || index > permsToUse.length) return collector.stop();
                
                newPerms ^= perms.permNums[permsToUse[index - 1]];

                var embed = permsEmbed(botUser.name, message.member.nickname || message.author.username, message.guild.name, newPerms, permsToUse, member.user.avatarURL(), self);
                embed.addField(`Currently editing permissions`, 'To toggle a permission, simply type the number of the permission you want to change. Type anything else to stop changing permissions.');

                sentMessage.edit(embed);
                msg.delete();

                setTimeout(size => {
                    if (collector.collected.size == size) {
                        collector.stop();
                    }
                }, 10000, collector.collected.size);
            })
            .on('end', () => {
                var embed = permsEmbed(botUser.name, message.member.nickname || message.author.username, message.guild.name, newPerms, permsToUse, member.user.avatarURL(), self);
                sentMessage.edit(embed);
                if (newPerms & perms.permNums.ADMIN) newPerms = -1;
                var update = { $set: {
                    perms: newPerms
                }};
                db.collection('members').updateOne({ userId: botMember.userId, serverId: botMember.serverId }, update);
            });
            setTimeout(size => {
                if (collector.collected.size == size) {
                    collector.stop();
                }
            }, 10000, collector.collected.size);
            return;
        } else if (spaceSplit[0] == 'default') {
            if (self) return message.channel.send(`**You can't give yourself permissions!**`);
            if (!(memberPerms & perms.permNums.SERVER)) return message.channel.send(`**You need the \`Server admin\` permission to change the permissions of a user!**`);
            if (!(memberPerms & perms.permNums.ADMIN) && botMember.perms & perms.permNums.SERVER) return message.channel.send(`**You need the \`Full admin\` permission to change the permissions of a server admin!**`);
            if (botMember.perms & perms.permNums.ADMIN) return message.channel.send(`**You cannot change the permissions of a full admin!**`);
            var server = await db.collection('servers').findOne({ serverId: message.guild.id });
            var update = { $set: {
                perms: server.defaultPerms
            }};
            db.collection('members').updateOne({ userId: botMember.userId, serverId: botMember.serverId }, update);
            message.channel.send(`**Reset the permissions of \`${botUser.name}\` to the default permissions of \`${message.guild.name}\`!**`);
            var embed = permsEmbed(botUser.name, message.member.nickname || message.author.username, message.guild.name, server.defaultPerms, permsToUse, member.user.avatarURL(), self);
            return message.channel.send(embed);
        }
    }
    message.channel.send(embed);
}).setAliases('perms').setHelp({
    category: 'Account',
    text: 'Checks or changes the permissions of a user',
    syntax: '[\'change\' | \'default\'] @user',
    examples: [
        {
            syntax: '',
            result: 'Shows you your permissions'
        },
        {
            syntax: '@user',
            result: 'Shows you the permissions of the mentioned user'
        },
        {
            syntax: 'change @user',
            result: 'Allows you to change the permissions of the mentioned user (if possible)'
        },
        {
            syntax: 'default @user',
            result: 'Resets the permissions of the mentioned user to the server default (if possible)'
        }
    ]
});

function permsEmbed(targetName, hostName, guildName, targetPerms, permsToUse, targetAvatar, self) {//botMember, member, memberPerms, guildName, self) {
    var permsEmbed = new Discord.MessageEmbed()
    .setColor('RED')
    .setTitle(`Permissions for **${targetName}** in **${guildName}**`)
    .setThumbnail(targetAvatar);

    if (!self) {
        permsEmbed.setFooter(`Only showing permissions that you have as well`);
    }

    var text = ``;
    var counter = 1;
    for (var perm of permsToUse) {
        text += `\`[${counter}]\` ${perms.permText[perm]}: **${targetPerms & perms.permNums[perm] ? 'YES' : 'NO'}\n**`;
        counter++;
    }

    permsEmbed.addField(`Requested by **${hostName}**`, text);

    return permsEmbed;
}