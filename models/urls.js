var mongoose = require('mongoose');
var schema = mongoose.Schema;
var urls = new schema({
    "tweet_id":{
        type:String,
        ref:'tweets'
    },
    "url":{
        type:String,
    }
},{collection:'urls'});

module.exports = mongoose.model('urls',urls);