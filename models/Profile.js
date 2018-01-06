
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var Education = require('./Education')

var Experience = require('./Experience')

var Skill  = require("./Skill")

var ProfileSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    description:String,
    address:String,
    gender:String,
    dob:Date,
    sections:[mongoose.SchemaTypes.Mixed],
})




module.exports = mongoose.model('Profile',ProfileSchema);

