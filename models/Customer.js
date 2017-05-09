var mongoose = require('mongoose');
mongoose.promise = require('bluebird');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var customerSchema = mongoose.schema({
    id: ObjectId,
    firstname: String,
    lastname: String,
    email: String,
    tickets: [{ type:  mongoose.Schema.ObjectId, ref:'Ticket' }]
});

customerSchema.methods.getFullName = function () {
  return this.firstname +' '+this.lastname;
};

module.exports = mongoose.model('Customer', customerSchema);