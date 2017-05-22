var mongoose = require('./mongodbHelp')();
var ticketSchema = mongoose.Schema({
    //id      : ObjectId,
    day: String,
    order: { type : mongoose.Schema.ObjectId, ref: 'Order' },
    ticketKind: { type : mongoose.Schema.ObjectId, ref: 'TicketKind' }
});

module.exports = mongoose.model('Ticket', ticketSchema);