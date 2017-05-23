var mongoose = require('./mongodbHelp')();
var ticketKindSchema = mongoose.Schema({
    //id      : ObjectId,
    ticketKind: String,
    description: String,
    ticketDayPrice: Number,
    ticketPPPrice: Number,
    visible: Boolean,
    availableOn : {
        friday: Number,
        saturday: Number,
        sunday: Number
    },
});
ticketKindSchema.methods.whatWasTheDate= function () {
    return this.date;
};

module.exports = mongoose.model('TicketKind', ticketKindSchema);