var mongoose = require('./mongodbHelp')();
var ticketSchema = mongoose.Schema({
    //id      : ObjectId,
    day: String,
    order: { type : mongoose.Schema.ObjectId, ref: 'Order' },
    ticketKind: { type : mongoose.Schema.ObjectId, ref: 'TicketKind' }
});

ticketSchema.methods.getDay = function () {
    var days =
    {
        'friday':'Vrijdag',
        'saturday':'Zaterdag',
        'sunday':'Zondag',
        'allday':'Alle dagen'
    }

    return days[this.day];
};
module.exports = mongoose.model('Ticket', ticketSchema);