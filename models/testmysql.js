/**
 * Created by ruben on 03-Oct-16.
 */
var mysql = require('./db.js');

var test1 = function () {
};


test1.getBezoekers = function (callback) {
    var query ="select * from bezoeker;";
    mysql.connection(function (err, conn){
        if(err) {
            return callback(err);
        }

        conn.query(query, function (err, rows){
            if(err) return callback(err, null);

            else return callback(null, rows);
        })
    });

};

module.exports = test1;