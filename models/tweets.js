var mongoose = require('mongoose');
var schema = mongoose.Schema;
var tweets = new schema({
    "_id":{
        type:String,
        required:true
    },
    "time":{
        type:String,
    },
    "text":{
        type:String
    },
    "userid":{
        type:String,
        required:true,
        ref:'users'
    },
    "retweet_count":{
        type:Number
    },
    "favorite_count":{
        type:Number
    },
    "language":{
        type:String
    }
},{collection:'tweets'});

module.exports = mongoose.model('tweets',tweets);