
var mongoose = require("mongoose");


var SkillSchema = new mongoose.Schema({
    skill: String

})

module.exports = mongoose.model('Skill',SkillSchema);
