# twitter-api
Backend API Assignment for Hackercamp 2018

## Install instruction
  1. Install Node and npm in your system.
  2. Install MongoDB(3.2 or higher).

## How to run it on your local machine
  1. Fork the repository to your github account.
  2. Clone the repository to your local machine.
  3. open terminal window and cd into the directory.
  4. run command :- npm install , this will install the node depedencies.
  5. run command :- node index.js
  6. The API is now listening on http://127.0.0.1:3000
    if the listening IP or port is not free then change the IP or Port no. and then goto step 5.

## Database Schema
  "stored in models directory"
  1. tweets : _id,time,text,userid:{ref:users},retweet_count,favorite_count,language,retweeted,favorited,jsdate
  2. users : _id,name,screen_name,follower_count,friend_count
  3. urls_user_mentions : _id,tweet_id:{ref:tweets},content,type
  
  
# API documentation:
  To start streaming the tweets make a GET call at http://127.0.0.1:3000/?track=keyword
  
  for multiple keyword tracking use ?track=keyword_1,keyword_2,....keyword_n
  
  
  To stop a running tweet stream make a GET call at http://127.0.0.1:3000/stop_stream
  
  To filter data according to queries you have to make a GET call at http://127.0.0.1:3000/filter_data?param_1=value_1&param_2=value_2&....&param_n=value_n
  
  To get the filtered tweets in a CSV file make a GET call at http://127.0.0.1:3000/get_csv?keys=col_1,col_col_2,...,col_n
  
## Parameters for filtering data
  1. sort : { -1 : descending, 1 : ascending, default : 1 }
  2. sorting_field : {allowed_fields : [ time , text , retweet_count , favorite_count , language ] , default : time}
  3. text : {substring matching}
  4. language : { string matching }
  5. start_date : { ISO (Date-Time) format , default : January 1, 1970 }
  6. end_date : { ISO (Date-Time } format , default : current time }
  7. limit : { no. of tweets to return at a time, default : 10 }
  8. page : { page no. of tweets , default : 1 }
  9. user_name : { search for a user_name }
  10. user_name_type : { allowed_strings: [contains,starts,ends,exact], default : exact }
  11. screen_name : {search for a screen_name }
  12. screen_name_type : { allowed_strings: [contains,starts,ends,exact], default : exact }
  13. url : {search for a url mentioned in tweet }
  14. url_type : { allowed_strings: [contains,starts,ends,exact], default : exact }
  15. user_mention : {search for a user mentioned in the tweet }
  16. user_mention_type : { allowed_strings: [contains,starts,ends,exact], default : exact }
  17. retweet_min : { minimum retweets filter, default : 0 }
  18. retweet_max : { maximum retweets filter, default : 100000000 }
  19. retweets : { exact number of retweets filter , note : overwrites retweet_min and retweet_max }
  20. favorite_min : { minimum favorites filter, default : 0 }
  21. favorite_max : { maximum favorites filter, default : 100000000 }
  22. favorite : { exact number of favorited filter , note : overwrites favorite_min and favorite_max }
  23. follower_min : {minimum followers filter , default : 0 }
  24. follower_max : {maximum followers filter , default : 100000000 }
  25.  follower : { exact number of followers filter , note: overwrites follower_min and follower_max }
  26. friend_min : {minimum friends filter , default : 0 }
  27. friend_max : {maximum friends filter , default : 100000000 }
  28. friends : { exact number of friends filter , note: overwrites friends_min and friends_max }
  
## Parameter for getting CSV of filtered data

  keys : {
    allowed fields : 
      ['_id','text','userid._id','userid.name','userid.screen_name','userid.friend_count','user.follower_count','retweet_count','favorite_count','language','time','retweeted','favorited']
    }
  
  note : if no parameter is sent in ?keys= then all the keys will be returned in the CSV
 
## Libraries/modules used

  1. Express
  2. Mongoose
  3. twitter
  4. json-2-csv

## External references
 
    Twitter developer docs : https://developer.twitter.com/en/docs
    
    twitter node mudule : https://www.npmjs.com/package/twitter
    
    json-2-csv : https://github.com/mrodrig/json-2-csv/wiki/json2csv-Documentation
    
   
