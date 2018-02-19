var mongoose = require('mongoose');
var schema = mongoose.Schema;
var urls_user_men = new schema({
    "tweet_id":{
        type:String,
        ref:'tweets'
    },
    "content":{
        type:String,
    },
    "screen_name":{
    	type:String
    },
    "type":{
        type:String
    }
},{collection:'urls_user_mentions'});

module.exports = mongoose.model('urls_user_mentions',urls_user_men);