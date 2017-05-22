var mongoose = require('./mongodbHelp')();

var testSchema = mongoose.Schema({
    name: String
});



module.exports = mongoose.model('Test', testSchema);