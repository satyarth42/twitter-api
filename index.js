var http = require('http');
var app = require('express')();
var twit = require('twitter');
var mongoose = require('mongoose');
var converter = require('json-2-csv')

//add your own credentials for the following fields from your twitter developer account.
var twitter = new twit({
	consumer_key: '',
  	consumer_secret: '',
 	access_token_key: '',
  	access_token_secret: ''
});
//connecting to mongoose db running on 127.0.0.1:27017 with DB name twitter-api
mongoose.connect('mongodb://127.0.0.1:27017/twitter-api');
var stream;
var filtered_data;

//getting the mongoose models for DB connectivity
var tweets = require('./models/tweets.js');
var mentions = require('./models/urls_user_mentions.js');
var users = require('./models/users.js');

//error handling
app.get('/error',function(req,res){
	res.send('error: track query missing');
});

//api listener for starting the tracking stream.
app.get('/',function(req,res){
	var track;
	if(!req.query.track)
		res.redirect('/error');
	res.sendStatus(200);
	//twitter stream created and listening
	stream = twitter.stream('statuses/filter', {track: req.query.track});
	stream.on('data', function(event) {
		//checking for arriving stream
	  if(event && event.text){
	  	//checking if a user already exists.
		  users.find({_id:event.user.id_str},function(err,docs){
		  	if(docs.length==0){
		  		//storing some metadata of twitter user in users collection.
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

		  //creating tweet metadata document
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
		  //checking if in case tweet alrady exists
		  tweets.find({_id:event.id_str},function(err,doc){
		  	if(doc.length==0){
		  		//storing some tweet metadata in tweets collection
		  		tweet_data.save(function(err,updated){
		  		if(err) console.log(err);
		  		});

		  		//storing urls mentioned in tweets in urls_user_mentions collection
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
		  		//storing users mentioned in tweets in urls_user_mentions collection
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
	 //handling for case if there is an error in twitter stream
	stream.on('error', function(error) {
	  res.send('error occured');
	  stream.destroy();
	});
});

//api listener for stopping twitter stream.
app.get('/stop_stream',function(req,res){
	if(stream){
		stream.destroy();
		res.sendStatus(200);
	}
	else
		res.send("no_running_stream");
});

//api listener for filtering data
app.get('/filter_data',function(req,res){
	var language,text,sort_order,sorting_field,start_date,end_date,limit,page,user_name,screen_name,url,user_mention,retweet_min,retweet_max,favorite_min,favorite_max,follower_min,follower_max,friend_min,friend_max;
	var params = req.query;

	//checking for sort query passed in ajax call
	if(!params.sort)
		sort_order=1;
	else if(params.sort=='-1')
		sort_order=-1;
	else
		sort_order=1;
	//checking for sorting field query passed in ajax call
	if(!params.sorting_field)
		sorting_field="jsdate";
	else{
		if(params.sorting_field=="time")
			sorting_field="jsdate"
		else
			sorting_field=params.sorting_field;
	}

	//checking if text searching is required.
	if(params.text)
		text = ".*"+params.text+".*";
	else
		text = ".*";

	//checking for language filter passed in ajax call
	if(params.language)
		language = params.language;
	else
		language = ".*";
	//checking for start date filter passed in ajax call
	if(params.start_date){
		//date should strictly be in ISO (Date-Time) format
		start_date = params.start_date;
		start_date = new Date(start_date);
		start_date = start_date.getTime();
	}
	else
		start_date=0;

	//checking for end date filter passed in ajax call
	if(params.end_date){
		//date should strictly be in ISO (Date-Time) format
		end_date=params.end_date;
		end_date=new Date(end_date);
		end_date = end_date.getTime();
	}
	else
	{
		var d = new Date();
		end_date = d.getTime();
	}

	//checking for pagination limit filter
	if(params.limit)
		limit=Number(params.limit);
	else
		limit=10;

	//checking for pagination page number filter
	if(params.page)
		page=Number(params.page);
	else
		page=1;

	//checking for user name filter
	if(params.user_name)
		user_name=params.user_name;
	else
		user_name=".*";

	//checking for user_name matching filter contains/exact/starts_with/ends_with
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

	////checking for screen_name filter
	if(params.screen_name)
		screen_name=params.screen_name;
	else
		screen_name=".*";

	//checking for screen_name matching filter contains/exact/starts_with/ends_with
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

	//checking for urls filter
	if(params.url)
		url=params.url;
	else
		url=".*";

	//checking for url matching filter contains/exact/starts_with/ends_with
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

	//checking for user_mentions filter
	if(params.user_mention)
		user_mention=params.user_mention;
	else
		user_mention=".*";

	//checking for user_mentions matching filter contains/exact/starts_with/ends_with
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

	//checking for retweets range filter
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

	//checking for favorited range filter
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

	//checking for followers range filter
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

	//checking for friends range filter
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

	//enabling for only url or only user_mention filter
	if(url==".*" && user_mention!=".*")
		url="no-url";
	else if(url!=".*" && user_mention==".*")
		user_mention="no-user";

	//finding url and user mentions from urls_user_mentions collection
	mentions.find(
		{
			$or:[
				{
					//if url is present according to filtering
					$and:[
						{type:'url'},
						{content:{$regex:url,$options:'i'}}
					]
				},
				{
					//if user is mentioned according to filtering
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
			//extracting the tweet_ids for url and user mentions.
			var tweet_id = [];
			docs.forEach(function(item,index){
				tweet_id.push(item.tweet_id);
			});
			//filtering the user_ids.
			users.find({
				$and:[
					{
						//filter for user_name
						name:{$regex:user_name,$options:'i'}
					},
					{
						//filter for screen_name
						screen_name:{$regex:screen_name,$options:'i'}
					},
					{
						//range filter for followers
						$and:[{follower_count:{$gte:follower_min}},{follower_count:{$lte:follower_max}}]
					},
					{
						//range filter for friends
						$and:[{friend_count:{$gte:friend_min}},{friend_count:{$lte:friend_max}}]
					}
				]
			},function(err,user_data){
				//extracting the user_ids according to filter
				var user_id = [];
				user_data.forEach(function(item,index){
					user_id.push(item._id);
				});
				tweets.find({
					//putting filter on tweets
					$and:[
						{
							//filter on tweet_id if present in url or user mentions
							_id:{$in:tweet_id}
						},
						{
							//filter if tweet is in given time range
							$and:[{jsdate:{$lte:end_date}},{jsdate:{$gte:start_date}}]
						},
						{
							//filter for text searching in tweet
							text:{$regex:text,$options:'i'}
						},
						{
							//language filter
							language:{$regex:language,$options:'i'}
						},
						{
							//filter on user_id if present in filtered users
							userid:{$in:user_id}
						},
						{
							//filter on retweet count range
							$and:[{retweet_count:{$lte:retweet_max}},{retweet_count:{$gte:retweet_min}}]
						},
						{
							//filter on favorited count range
							$and:[{favorite_count:{$lte:favorite_max}},{favorite_count:{$gte:favorite_min}}]
						}
					]
				},function(err,tweet_data){
					if(err) console.log(err);
					else{
						//sorting data according to column
						filtered_data = tweet_data.sort(GetSortOrder(sorting_field,sort_order));
						//pagination
						filtered_data = filtered_data.slice(limit*(page-1),limit*(page-1)+limit);
						//sending JSON output
						res.send(JSON.stringify(filtered_data));
					}
				}).populate({path:'userid',select:'_id name screen_name followers_count friend_count followers_count'}).select('-__v');

			}).select('_id');
		}
	}).select('tweet_id -_id');
});

//api listener for generating CSV file
app.get('/get_csv',function(req,res){


	var keys;
	//checkign for keys required in CSV
	if(!req.query.keys)
		keys = ['_id','text','userid._id','userid.name','userid.screen_name','userid.friend_count','user.follower_count','retweet_count','favorite_count','language','time','retweeted','favorited'];
	else
		keys = req.query.keys.split(',');
	//options for CSV
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

	//CSV generation function call
	converter.json2csv(filtered_data,function(err,csv){
		if(err) console.log(err);
		else{
			//sending the generated SCV as a file
			res.setHeader('Content-disposition', 'attachment; filename=filtered_data.csv');
  			res.set('Content-Type', 'text/csv');
  			res.status(200).send(csv);
		}
	},options);
});

//function for parsing twiitter date format to ISO(Date-Time) format
function parseTwitterDate(aDate)
{   
  return new Date(Date.parse(aDate.replace(/( \+)/, ' UTC$1')));
}

//function for sorting
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

//server listening on http://127.0.0.1:3000
app.listen(3000,'127.0.0.1');