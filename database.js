
var process = require('process');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

var connection;
var db;

module.exports = {
    init: init,
    getDB: () => db,
    getConnection: () => connection
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
    return db;
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