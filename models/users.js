var mongoose = require('mongoose');
var schema = mongoose.Schema;
var user = new schema({
    "_id":{
        type:String,
        required:true
    },
    "name":{
        type:String,
    },
    "screen_name":{
        type:String
    },
    "follower_count":{
        type:Number,
    },
    "friend_count":{
        type:Number
    }
},{collection:'users'});

module.exports = mongoose.model('users',user);