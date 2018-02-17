var mongoose = require('mongoose');
var schema = mongoose.Schema;
var user_men = new schema({
    "tweet_id":{
        type:String,
        ref:'tweets'
    },
    "name":{
        type:String,
    },
    "screen_name":{
    	type:String
    }
},{collection:'user_mentions'});

module.exports = mongoose.model('user_mentions',user_men);