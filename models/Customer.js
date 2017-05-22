var mongoose = require('./mongodbHelp')();
var customerSchema = mongoose.Schema({
    //id: ObjectId,
    firstname: String,
    lastname: String,
    email: String,
});

customerSchema.methods.getFullName = function () {
  return this.firstname +' '+this.lastname;
};

module.exports = mongoose.model('Customer', customerSchema);