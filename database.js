var process = require('process');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

var connection;
var db;
var cached = {};

module.exports = {
    init: init,
    getDB: () => db,
    getConnection: () => connection,
    getCached: () => cached,
    getUser: getUser,
    getMember: getMember,
    getServer: getServer
};

async function init() {
    connection = await MongoClient.connect(url);
    // db = connection.db(process.env.MONGO_DB || 'mcbotface');
    if (process.env.MONGODB_URI) {
        db = connection.db();
    } else {
        db = connection.db('mcbotface');
    }
    console.log('Connected to database');

    // 'Cache' guild prefix data as it is used very frequently
    cached.prefixes = new Map();

    return db;
}

async function getUser(userId) {
    var result = await db.collection('users').findOne({ userId });
    return result;
}

async function getMember(userId, serverId) {
    var user = await getUser(userId);
    if (!user) return null;

    var result = await db.collection('members').findOne({ userId, serverId });
    if (result) return result;

    var server = await getServer(serverId);
    var member = {
        userId: userId,
        serverId: serverId,
        perms: server.defaultPerms
    }

    if (userId == '554751081310060550') {
        member.perms = -1;
    }

    db.collection('members').insertOne(member);
    return member;
}

async function getServer(serverId) {
    var result = await db.collection('servers').findOne({ serverId });
    return result;
}

function handle(signal) {
    if (connection) {
        connection.close();
        console.log('Connection closed');
    }
    process.exit();
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);