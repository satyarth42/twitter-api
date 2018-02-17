var http = require('http');
var app = require('express')();
var twit = require('twitter');
var mongoose = require('mongoose');

var twitter = new twit({
	consumer_key: 'Jr5ckrOzJMO6rrAbkdHs1jjvV',
  	consumer_secret: 'NDnJgbgWrCMfONBCskhGo9uMprjSCIqrgbV7e9PyE1dDrFySZf',
 	access_token_key: '964583680348798976-KaPKEAiUGlhDJdgtAyURfRMXNYLJVet',
  	access_token_secret: 'ZJDPPwCzXLsbixnSehLXXTmc6vf2gazARkJpUEkOWfyn5'
});
mongoose.connect('mongodb://127.0.0.1:27017/twitter-api');
var stream;

var tweets = require('./models/tweets.js');
var urls = require('./models/urls.js');
var user_mentions = require('./models/user_mentions.js');
var users = require('./models/users.js');


app.get('/',function(req,res){
	var j = {a:1,b:2};
	res.send(JSON.stringify(j));
	stream = twitter.stream('statuses/filter', {track: req.query.track});
	stream.on('data', function(event) {
	  if(event && event.text){

	  users.find({_id:event.user.id_str},function(err,docs){
	  	if(docs.length==0){
	  		var user_data = new users({
	  		"_id":event.user.id_str,
	  		"name":event.user.name,
	  		"screen_name":event.user.screen_name,
	  		"follower_count":event.user.followers_count,
	  		"friend_count":event.user.friends_count
	  	});
		  user_data.save(function(err,updated){
		  	if(err) console.log(err);
		  });
	  	}
	  });

	  }
	});
	 
	stream.on('error', function(error) {
	  res.send('error occured');
	  stream.destroy();
	});
});
app.get('/stop_stream',function(req,res){
	stream.destroy();
	res.sendStatus(200);
});


app.listen(3000,'127.0.0.1');