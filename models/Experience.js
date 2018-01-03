
var mongoose = require("mongoose");


var ExperienceSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    fromYear: String,
    toYear: String,



})

module.exports = mongoose.model('Experience',ExperienceSchema);
