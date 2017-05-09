var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected to the mongo database')
});

var ticketSchema = mongoose.schema({
    id      : ObjectId,
    date: { type : Date, default: Date.now },
    order: { type : mongoose.Schema.ObjectId, ref: 'Order' }
});
ticketSchema.methods.getDate= function () {
    return this.date;
};

module.exports = mongoose.model('Ticket', ticketSchema);