var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/partTimeJob')
var subscriberSchema = new mongoose.Schema({
    email: { type: String, unique: true }
})

var Subscriber = mongoose.model('Subscriber', subscriberSchema)

module.exports = Subscriber
