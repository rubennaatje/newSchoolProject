var mysql = require('mysql');
var config = require('./config');

var pool = mysql.createPool({
    connectionLimit: 50,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.dbport,
    multipleStatements: true,
    timeout: 100000000
});

var connection = function (callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            callback(err, null);
            return;
        } else {
            return callback(null, conn);
        }
    })
};

exports.connection = connection;