# tweetProcessor

### Install
git clone git@github.com:maeuca/tweetProcessor.git or download zip
  
npm install

npm run build

npm start

View Report - @http://localhost:3001/twitter/tweets/report

Rest Api - import test/postman/collection into postman to see request for report.json


## Summary
The Twitter Streaming API provides real-time access to public tweets. In this assignment you will build an application that connects to the Streaming API and processes incoming tweets to compute various statistics. We'd like to see this as a NodeJS project, but otherwise feel free to use any libraries you want to accomplish this task.


The sample endpoint provides a random sample of approximately 1% of the full tweet stream. Your app should consume this sample stream and keep track of the following:

^Total number of tweets received

^Average tweets per hour/minute/second

^ Top emojis in tweets

^ Percent of tweets that contains emojis

^Top hashtags

^Percent of tweets that contain a url

^Percent of tweets that contain a photo url (pic.twitter.com or instagram)

^Top domains of urls in tweets

