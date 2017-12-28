
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var ProfileSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    description:String,
    address:String,
    gender:String,
    dob:Date
    
    
    
})




module.exports = mongoose.model('Profile',ProfileSchema);

