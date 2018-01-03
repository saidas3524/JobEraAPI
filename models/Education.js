
var mongoose = require("mongoose");


var EducationSchema = new mongoose.Schema({
    institute: String,
    fromYear: String,
    toYear: String,
    degree: String,
    branch: String,
    grade: String



})

module.exports = mongoose.model('Education',EducationSchema);
