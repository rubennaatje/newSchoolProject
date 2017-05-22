var mongoose = require('./mongodbHelp')();
var orderSchema = mongoose.Schema({
    //id      : ObjectId,
    email: String,
    firstName: String,
    lastName: String,
    date: { type : Date, default: Date.now },
    tickets: [ {type : mongoose.Schema.ObjectId, ref : 'Ticket'} ],
});
orderSchema.methods.whatWasTheDate= function () {
    return this.date;
};

module.exports = mongoose.model('Order', orderSchema);