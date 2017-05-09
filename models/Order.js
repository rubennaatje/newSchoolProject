var mongoose = require("mongoose");
mongoose.Promise = require('bluebird');

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected to the mongo database')
});

var orderSchema = mongoose.schema({
    id      : ObjectId,
    date: { type : Date, default: Date.now },
    tickets: [ {type : mongoose.Schema.ObjectId, ref : 'Ticket'} ],
    costumer: {type : mongoose.Schema.ObjectId, ref: 'Costumer'}
});
orderSchema.methods.whatWasTheDate= function () {
    return this.date;
};

module.exports = mongoose.model('Order', orderSchema);