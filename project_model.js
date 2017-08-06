var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/partTimeJob')
var projectSchema = new mongoose.Schema({
    title: String,
    status: String,
    rewardNo: { type: String, unique: true },
    type: String,
    price: String,
    projectType: String,
    projectDuration: String,
    detail: String
})

var Project = mongoose.model('Project', projectSchema)

module.exports = Project
