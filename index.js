var http = require('http');
var app = require('express')();
var twit = require('twitter');
var mongoose = require('mongoose');
var converter = require('json-2-csv')

var twitter = new twit({
	consumer_key: 'Jr5ckrOzJMO6rrAbkdHs1jjvV',
  	consumer_secret: 'NDnJgbgWrCMfONBCskhGo9uMprjSCIqrgbV7e9PyE1dDrFySZf',
 	access_token_key: '964583680348798976-KaPKEAiUGlhDJdgtAyURfRMXNYLJVet',
  	access_token_secret: 'ZJDPPwCzXLsbixnSehLXXTmc6vf2gazARkJpUEkOWfyn5'
});
mongoose.connect('mongodb://127.0.0.1:27017/twitter-api');
var stream;
var filtered_data;

var tweets = require('./models/tweets.js');
var mentions = require('./models/urls_user_mentions.js');
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


		  var tweet_data = new tweets({
		  		"_id":event.id_str,
		  		"text":event.text,
		  		"userid": event.user.id_str,
		  		"retweet_count":event.retweet_count,
		  		"favorite_count":event.favorite_count,
		  		"language":event.lang,
		  		"time":event.created_at,
		  		"retweeted":event.retweeted,
		  		"favorited":event.favorited,
		  		"jsdate":parseTwitterDate(event.created_at).getTime()
		  });
		  tweets.find({_id:event.id_str},function(err,doc){
		  	if(doc.length==0){
		  		tweet_data.save(function(err,updated){
		  		if(err) console.log(err);
		  		});

		  		event.entities.urls.forEach(function(item,index){
			  	var urls_data = new mentions({
			  		"tweet_id":event.id_str,
			  		"content":item.url,
			  		"type":"url"
			  	});
			  	urls_data.save(function(err,updated){
			  		if(err) console.log(err);
			  	});
			  });

		  		event.entities.user_mentions.forEach(function(item,index){
			  	var user_mentions_data = new mentions({
			  		"tweet_id":event.id_str,
			  		"content":item.screen_name,
			  		"type":"user"
			  	});
			  	user_mentions_data.save(function(err,updated){
			  		if(err) console.log(err);
			  	});
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

app.get('/filter_data',function(req,res){
	var language,text,sort_order,sorting_field,start_date,end_date,limit,page,user_name,screen_name,url,user_mention,retweet_min,retweet_max,favorite_min,favorite_max,follower_min,follower_max,friend_min,friend_max;
	var params = req.query;
	if(!params.sort)
		sort_order=1;
	else if(params.sort=='-1')
		sort_order=-1;
	else
		sort_order=1;
	if(!params.sorting_field)
		sorting_field="jsdate";
	else{
		if(params.sorting_field=="time")
			sorting_field="jsdate"
		else
			sorting_field=params.sorting_field;
	}

	if(params.text)
		text = ".*"+params.text+".*";
	else
		text = ".*";

	if(params.language)
		language = params.language;
	else
		language = ".*";

	if(params.start_date){
		start_date = params.start_date;
		start_date = new Date(start_date);
		start_date = start_date.getTime();
	}
	else
		start_date=0;

	if(params.end_date){
		end_date=params.end_date;
		end_date=new Date(end_date);
		end_date = end_date.getTime();
		console.log(end_date);
	}
	else
	{
		var d = new Date();
		end_date = d.getTime();
	}

	if(params.limit)
		limit=Number(params.limit);
	else
		limit=10;

	if(params.page)
		page=Number(params.page);
	else
		page=1;

	if(params.user_name)
		user_name=params.user_name;
	else
		user_name=".*";

	if(user_name!=".*"){
		if(params.user_name_type=="contains"){
			user_name=".*"+user_name+".*";
		}
		else if(params.user_name_type=="starts"){
			user_name="^"+user_name+".*";
		}
		else if(params.user_name_type=="ends"){
			user_name=".*"+user_name+"$";
		}
	}

	if(params.screen_name)
		screen_name=params.screen_name;
	else
		screen_name=".*";

	if(screen_name!=".*"){
		if(params.screen_name_type=="contains"){
			screen_name=".*"+screen_name+".*";
		}
		else if(params.screen_name_type=="starts"){
			screen_name="^"+screen_name+".*";
		}
		else if(params.screen_name_type=="ends"){
			screen_name=".*"+screen_name+"$";
		}
	}

	if(params.url)
		url=params.url;
	else
		url=".*";

	if(url!=".*"){
		if(params.url_type=="contains"){
			url=".*"+url+".*";
		}
		else if(params.url_type=="starts"){
			url="^"+url+".*";
		}
		else if(params.url_type=="ends"){
			url=".*"+url+"$";
		}
	}

	if(params.user_mention)
		user_mention=params.user_mention;
	else
		user_mention=".*";

	if(user_mention!=".*"){
		if(params.user_mention_type=="contains"){
			user_mention=".*"+user_mention+".*";
		}
		else if(params.user_mention_type=="starts"){
			uuser_mention="^"+user_mention+".*";
		}
		else if(params.user_mention_type=="ends"){
			user_mention=".*"+user_mention+"$";
		}
	}

	if(params.retweet_min)
		retweet_min = params.retweet_min;
	else
		retweet_min = 0;

	if(params.retweet_max)
		retweet_max = params.retweet_max;
	else
		retweet_max = 100000000;

	if(params.retweets){
		retweet_max = params.retweets;
		retweet_min = params.retweets;
	}

	if(params.favorite_min)
		favorite_min = params.favorite_min;
	else
		favorite_min = 0;

	if(params.favorite_max)
		favorite_max = params.favorite_max;
	else
		favorite_max = 100000000;

	if(params.favorite){
		retweet_max = params.favorite;
		retweet_min = params.favorite;
	}

	if(params.follower_min)
		follower_min = params.follower_min;
	else
		follower_min = 0;

	if(params.follower_max)
		follower_max = params.follower_max;
	else
		follower_max = 100000000;

	if(params.follower){
		follower_min = params.follower;
		follower_max = params.follower;
	}

	if(params.friend_min)
		friend_min = params.friend_min;
	else
		friend_min = 0;

	if(params.friend_max)
		friend_max = params.friend_max;
	else
		friend_max = 100000000;

	if(params.friends){
		friend_min = params.friends;
		friend_max = params.friends;
	}

	if(url==".*" && user_mention!=".*")
		url="no-url";
	else if(url!=".*" && user_mention==".*")
		user_mention="no-user";
	mentions.find(
		{
			$or:[
				{
					$and:[
						{type:'url'},
						{content:{$regex:url,$options:'i'}}
					]
				},
				{
					$and:[
						{type:'user'},
						{content:{$regex:user_mention,$options:'i'}}
					]
				}
			]
		}
	,function(err,docs){
		if(err) console.log(err);
		else{
			var tweet_id = [];
			docs.forEach(function(item,index){
				tweet_id.push(item.tweet_id);
			});
			users.find({
				$and:[
					{
						name:{$regex:user_name,$options:'i'}
					},
					{
						screen_name:{$regex:screen_name,$options:'i'}
					},
					{
						$and:[{follower_count:{$gte:follower_min}},{follower_count:{$lte:follower_max}}]
					},
					{
						$and:[{friend_count:{$gte:friend_min}},{friend_count:{$lte:friend_max}}]
					}
				]
			},function(err,user_data){
				var user_id = [];
				user_data.forEach(function(item,index){
					user_id.push(item._id);
				});
				tweets.find({
					$and:[
						{
							_id:{$in:tweet_id}
						},
						{
							$and:[{jsdate:{$lte:end_date}},{jsdate:{$gte:start_date}}]
						},
						{
							text:{$regex:text,$options:'i'}
						},
						{
							language:{$regex:language,$options:'i'}
						},
						{
							userid:{$in:user_id}
						},
						{
							$and:[{retweet_count:{$lte:retweet_max}},{retweet_count:{$gte:retweet_min}}]
						},
						{
							$and:[{favorite_count:{$lte:favorite_max}},{favorite_count:{$gte:favorite_min}}]
						}
					]
				},function(err,tweet_data){
					if(err) console.log(err);
					else{
						filtered_data = tweet_data.sort(GetSortOrder(sorting_field,sort_order));
						filtered_data = filtered_data.slice(limit*(page-1),limit*(page-1)+limit);
						res.send(JSON.stringify(filtered_data));
					}
				}).populate({path:'userid',select:'_id name screen_name followers_count friend_count followers_count'}).select('-__v');

			}).select('_id');
		}
	}).select('tweet_id -_id');
});

app.get('/get_csv',function(req,res){


	var keys;
	if(!req.query.keys)
		keys = ['_id','text','userid._id','userid.name','userid.screen_name','userid.friend_count','user.follower_count','retweet_count','favorite_count','language','time','retweeted','favorited'];
	else
		keys = req.query.keys.split(',');
	var options = {
		'delimiter':{
			'wrap' : '"',
			'field' : ',',
			'array' : ';',
			'eol' : '\n',
		},
		'prependHeader'    : true,
	    'sortHeader'       : false,
	    'trimHeaderValues' : false,
	    'trimFieldValues'  : false,
	    'emptyFieldValue'  : 'null',
	    'keys'             : keys
	}

	converter.json2csv(filtered_data,function(err,csv){
		if(err) console.log(err);
		else{
			res.setHeader('Content-disposition', 'attachment; filename=filtered_data.csv');
  			res.set('Content-Type', 'text/csv');
  			res.status(200).send(csv);
		}
	},options);
});

function parseTwitterDate(aDate)
{   
  return new Date(Date.parse(aDate.replace(/( \+)/, ' UTC$1')));
}

function GetSortOrder(prop,sort_order) {  
    return function(a, b) {  
        if (a[prop] > b[prop]) {  
            return 1*sort_order;  
        } else if (a[prop] < b[prop]) {  
            return -1*sort_order;  
        }  
        return 0;  
    }  
}  

app.listen(3000,'127.0.0.1');