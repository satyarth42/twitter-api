# twitter-api
<b>Backend API Assignment for Hackercamp 2018</b>

This API aims to make data collection and filteration from the social media site twitter.com easy for someone with no backend programming  experience. This API is basically divided into 4 parts
  
  1. <b>API 1</b> : will start a twitter stream for the keywords sent along with the API call to store the tweet and some of its metadata into a NoSQL database(MongoDB) in realtime.
  2. <b>API 3</b> : this API call will be used for filtering the collected data in API 1. The filtering can be done on a number of parameters described below. E.g. filtering by a user who posted the tweet, the time range in which tweet was posted, etc. The data can be sorted according to a no. of fields described below. E.g. lexicographically reverse order according to text of the tweet.
  3. <b>API 3</b> : will be used to export the filtered data generated in API 2  in a CSV file and sent to the client.
  4. <b>API 4</b> : this API call will be used to stop a running twitter stream.

## Install instructions
  1. <a href='https://nodejs.org/en/'>Install Node and npm in your system.</a>
  2. <a href='https://www.mongodb.com/download-center'>Install MongoDB(3.2 or higher).</a>

## How to run it on your local machine
  1. Fork the repository to your github account.
  2. Clone the repository to your local machine.
  3. Open index.js and add consumer_key,consumer_secret,access_token_key and access_token_secret. You can get these keys from https://developer.twitter.com/
  4. run MongoDB server.
  5. open terminal window and cd into the directory.
  6. run command :- npm install , this will install the node depedencies.
  7. run command :- node index.js
  8. The API is now listening on http://127.0.0.1:3000. If the listening IP or port is not free then change the IP or Port no. and then goto step 6.

## Database Schema
  the javascript files which define the database schema are in models directory
  1. tweets : _id,time,text,userid:{ref:users},retweet_count,favorite_count,language,retweeted,favorited,jsdate
  2. users : _id,name,screen_name,follower_count,friend_count
  3. urls_user_mentions : _id,tweet_id:{ref:tweets},content,type
  
  
# API documentation:
  To start streaming the tweets make a GET call at http://127.0.0.1:3000/?track=keyword_1,keyword_2,keyword_3...keyword_n
  
  To stop a running tweet stream make a GET call at http://127.0.0.1:3000/stop_stream
  
  To filter data according to queries you have to make a GET call at http://127.0.0.1:3000/filter_data?param_1=value_1&param_2=value_2&....&param_n=value_n
  
  To get the filtered tweets in a CSV file make a GET call at http://127.0.0.1:3000/get_csv?keys=col_1,col_col_2,...,col_n
  
## Parameters for filtering data
  1. sort : { -1 for descending, 1 for ascending, default : 1 }
  2. sorting_field : {allowed_fields : [ time , text , retweet_count , favorite_count , language ] , default : time}
  3. text : {substring matching}
  4. language : { string matching }
  5. start_date : { <b>JavaScript ISO (Date-Time)</b> format , default : 1970-01-01T00:00:00-00:00 }
  6. end_date : { <b>JavaScript ISO (Date-Time)</b> format , default : current time }
  7. limit : { no. of tweets to return at a time, default : 10 }
  8. page : { page no. of tweets , default : 1 }
  9. user_name : { search for a user_name }
  10. user_name_type : { string matching methods: {contains : substring , starts : prefix , ends : suffix , exact : same string } ,  default : exact }
  11. screen_name : {search for a screen_name }
  12. screen_name_type : { string matching methods: {contains : substring , starts : prefix , ends : suffix , exact : same string } ,  default : exact }
  13. url : {search for a url mentioned in tweet }
  14. url_type : { string matching methods: {contains : substring , starts : prefix , ends : suffix , exact : same string } ,  default : exact }
  15. user_mention : {search for a user mentioned in the tweet }
  16. user_mention_type : { string matching methods: {contains : substring , starts : prefix , ends : suffix , exact : same string } ,  default : exact }
  17. retweet_min : { minimum retweets filter, default : 0 }
  18. retweet_max : { maximum retweets filter, default : 100000000 }
  19. retweets : { exact number of retweets filter , note : overrides retweet_min and retweet_max }
  20. favorite_min : { minimum favorites filter, default : 0 }
  21. favorite_max : { maximum favorites filter, default : 100000000 }
  22. favorite : { exact number of favorited filter , note : overrides favorite_min and favorite_max }
  23. follower_min : {minimum followers filter , default : 0 }
  24. follower_max : {maximum followers filter , default : 100000000 }
  25.  follower : { exact number of followers filter , note: overrides follower_min and follower_max }
  26. friend_min : {minimum friends filter , default : 0 }
  27. friend_max : {maximum friends filter , default : 100000000 }
  28. friends : { exact number of friends filter , note: overrides friends_min and friends_max }
  
<u><b>Example</b></u>

  To extract the tweets for a user whose screen_name ends with 'per' with number of followers between 10 and 60 with exactly 60 friends who has mentioned a user with screen_name 'harry', sorted in lexicographically reverse order according to the tweet text , make a GET call in the following format
  
  http://127.0.0.1:3000/filter_data?screen_name=per&screen_name_type=ends&follower_min=10&follower_max=60&friends=60?user_mention=harry&sort=-1&sorting_field=text
  
## Parameter for getting CSV of filtered data

 To get the filtered tweets in a CSV file make a GET call at http://127.0.0.1:3000/get_csv?keys=col_1,col_col_2,...,col_n

  keys : {
    allowed fields : 
      ['_id','text','userid._id','userid.name','userid.screen_name','userid.friend_count','user.follower_count','retweet_count','favorite_count','language','time','retweeted','favorited']
    }
  
  note : if no parameter is sent in <b>keys</b> then all the columns will be returned in the CSV
 
## Libraries/modules/frameworks used

  1. <a href='https://expressjs.com/'>Express</a>
  2. <a href='http://mongoosejs.com/'>Mongoose</a>
  3. <a href='https://www.npmjs.com/package/twitter'>twitter</a>
  4. <a href='https://github.com/mrodrig/json-2-csv/wiki/json2csv-Documentation'>json-2-csv</a>
  
## My approach towards the assignment
  I decided to use Node.js and MongoDB as I am more comfortable in working on these technologies together. The first challenge which I faced was the way to collect the tweets in realtime in form of a stream. I searched for some time on the internet and found out about the <b>twitter</b> node module.
  
  The next challenge which I faced was to decide upon a schema which could be easily queried upon with high number of filtering parameters for use in API 2. After putting in some hours into this step I came up with a database schema and ways to write simplistic queries over it.
  
  The next phase, which was also the most challenging was to deal with missing parameters. It was quite evident that someone shouldn't make an API call with all the parameters every time even if only lexicographic sorting is required. To overcome this problem I decided to use the <b>$regex</b> with Mongoose. For strings, I manipulated the string to be matched according to the matching technique to be used. If any string parameter was absent, then I used $regex to accept all strings for that field. In the case of numbers, I decided to put the minimum field to be set to 0 and the maximum field to 100000000(10^8), if the required parameters was absent. For exact number filtering, I set both the minimum and the maximum fields to the same number for filtering. For filtering according to the range of date-time, the API requires the date to be passed in <b>JavaScript ISO(Date-Time) format</b>. During storing of tweets there is one field "jsdate" in the 'tweets' collection which contains the number of milliseconds passed since Jan. 1, 1970. "jsdate" is created by first parsing the twitter date-time format to JavaScript ISO(Date-Time) format and then using the getTime() method. If the start_date parameter is empty then it is set to Jan. 1,1970 and if the end_date parameter is empty then it is set to the current date and time of the server.
  
  Variable could not be passed into the mongoose query for sorting, so the filtered data was sorted accordingly by using a function.
  
  One more bug which occurred during development was that using the .limit() and .skip() with mongoose queries was not truly filtering the data into pages but was first paging the data in its unfiltered form and then filtering according to the parameters. To rectify this bug, the final sorted filtered data which was returned as an array was sliced using the <i>Array.prototype.slice()</i> function of JavaScript.
  
  To export the filtered data as CSV, I used another node module <b>json-2-csv</b> to convert the array of JavaScript objects into a CSV file.
  
  I also added one more API call to stop the twitter stream.

## External references
 
    Twitter developer docs : https://developer.twitter.com/en/docs
    
## Final notes :
  The testing of API was done on the following:
  1. Node (v6.10.2)
  2. MongoDB(3.2)
  3. Express(v4.16.2)
  4. Mongoose(v5.0.6)
  5. twitter (v1.7.1)
  6. json-2-csv(v2.1.2)
  
  AJAX calls were generated using <a href='https://www.getpostman.com/'>Postman</a>
   
