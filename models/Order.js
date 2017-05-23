var mongoose = require('./mongodbHelp')();
var qr = require('qr-image');
var PDFDocument = require('pdfkit');
var fileExistSync = require('./existsCheck');
var fs = require('fs');

var orderSchema = mongoose.Schema({
    //id      : ObjectId,
    email: String,
    firstName: String,
    lastName: String,
    date: { type : Date, default: Date.now },
    tickets: [ {type : mongoose.Schema.ObjectId, ref : 'Ticket'} ],
    paid: Boolean
});
orderSchema.methods.whatWasTheDate= function () {
    return this.date;
};
orderSchema.methods.getTickets = function (callback) {
    var doc = new PDFDocument;
    doc.pipe( fs.createWriteStream('out.pdf') );
    for(var i=0;i<this.tickets.length;i++){
        console.log(this.tickets[i]._id);
        var test = qr.imageSync((''+this.tickets[i]._id),{ type: 'png' });
        doc.image(test, 0, 0, { fit: [205, 205] });
        doc.text(this.tickets[i].ticketKind.ticketKind, 210, 30);
        doc.text(this.tickets[i].getDay(), 210, 60);
        doc.text(this.firstName + ' ' + this.lastName, 210, 90);
        if(i <this.tickets.length - 1)
            doc.addPage();
    }
    doc.end();
    return callback(null,doc);
};

module.exports = mongoose.model('Order', orderSchema);