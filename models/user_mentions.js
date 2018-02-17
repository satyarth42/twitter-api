var mongoose = require('mongoose');
var schema = mongoose.Schema;
var user_men = new schema({
    "tweet_id":{
        type:String,
        ref:'tweets'
    },
    "user_id":{
        type:String,
        ref:'users'
    }
},{collection:'user_mentions'});

module.exports = mongoose.model('user_mentions',user_men);