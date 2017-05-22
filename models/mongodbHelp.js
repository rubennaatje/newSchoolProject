/**
 * Created by ruben on 21/05/2017.
 */
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/conference');
var db = mongoose.connection;


module.exports = function (){

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log('connected to the mongo database')
    });

    return mongoose;
};