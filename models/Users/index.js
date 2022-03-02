const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* Create Schema*/
const UserSchema = new Schema({
    userId:{type:String,required:true},
    firstname : {type: String,default:""},
    lastname : {type: String,default:""},
    email : {type: String,required: true},
    password : {type: String,required: true},
    dateCreated : { type: Date, default: Date.now },
    dateModified : { type: Date, default: Date.now },
},{versionKey:false});
module.exports = mongoose.model('users', UserSchema);
