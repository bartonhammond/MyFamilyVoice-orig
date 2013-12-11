// Include Cloud Code module dependencies
var express = require('express'),
twilio = require('twilio');
var url = require('url');
var Buffer = require('buffer').Buffer;

var  twilioAccountSID =  'AC5be60567ea132f150762244ccf788ae6';
var  twilioAuthToken = '42420dd155a5997e75882993599a2d25';
var  twilioAppSID = 'AP8302a09988efdeb8e14ab812b71eb790';
var Activity = Parse.Object.extend('Activity');
var CallSid = Parse.Object.extend('CallSid');

// Create an Express web app (more info: http://expressjs.com/)
var app = express();

/**
 * The recording message
 *see: https://www.twilio.com/docs/howto/twilio-client-record
 */

app.get('/record', function(request, response) {
  // Create a TwiML response generator object
  var twiml = new twilio.TwimlResponse();
  
  twiml.say('Welcome to My Family Voice!  Please record your thoughts at the beep.',
            {voice:'alice', language:'en-GB'})
    .record({action:"/thanks",
             method:'GET',
             finishOnKey:'#',
             maxLength:'30'})
    .say('I did not hear a recording. Goodbye.',
         {voice:'alice', language:'en-GB'});
  // Render the TwiML XML document
  response.type('text/xml');
  response.send(twiml.toString());
  
});
/**
 * The thanks recording
 */
app.get('/thanks', function(request, response) {
  // Create a TwiML response generator object
  var parseQueryString = true;
  var queryData = url.parse(request.url, parseQueryString).query;
  var refererData = url.parse(request.headers.referer, parseQueryString).query;

  //Save the recordSid for reference in callback
  console.log('in thanks');
  console.log('RecordingSid: ' + queryData.RecordingSid);
  console.log('refererData.activity: ' + refererData.activity);
  Parse.Cloud.useMasterKey();
  var callSid = new CallSid();
  callSid.save({
    sid: queryData.RecordingSid,
    activity: refererData.activity
  }).then(function(sid) {
    console.log('got saved sid');
    console.log(sid);
  }).fail(function(error) {
    console.log('saving sid failed');
    console.log(error);
  });


  var twiml = new twilio.TwimlResponse();
  twiml.say('Thanks for your Family Voice recording. Here is what I heard and recorded for you.',
            {voice:'alice', language:'en-GB'})
    .pause({ length: 1 })
    .play(queryData.RecordingUrl)
    .say('Goodbye',
         {voice:'alice', language:'en-GB'});
  
  // Render the TwiML XML document
  response.type('text/xml');
  response.send(twiml.toString());

});
/**
 * At completion, move file form Twilio to Parse
 */
app.get('/callback', function(request, response) {
  // Create a TwiML response generator object
  var parseQueryString = true;
  var queryData = url.parse(request.url, parseQueryString).query;
  var refererData = url.parse(request.headers.referer, parseQueryString).query;

  console.log('in callback');
  console.log('refererData.RecordingSid: ' + refererData.RecordingSid);
  var _callSid = null;
  var _file = null;
  var query = new Parse.Query(CallSid);   
  query.equalTo("sid", refererData.RecordingSid);
  query.find()
    .then(function(callSidArray) {
      console.log('found callSid');
      console.log(callSidArray);
      _callSid = callSidArray[0];
      console.log(_callSid);
      console.log('recordingUrl:' + refererData.RecordingUrl);
      var url = refererData.RecordingUrl + ".wav";
      return Parse.Cloud.httpRequest({url: url});
    }).then(function(httpResponse) {
      console.log('got response');
      console.log(_callSid);
      return new Parse.File('recording.wav',{base64: httpResponse.buffer.toString('base64')}).save();
    }).then(function(file) {
      _file = file;
      console.log('got file');
      console.log(file);
      console.log('_callSid');
      console.log(_callSid);
      Parse.Cloud.useMasterKey();
      var query = new Parse.Query(Activity);
      query.equalTo('id',_callSid.activity);
      return query.find();
    }).then(function(activityArray) {
      var activity = activityArray[0];
      console.log('got the activity');
      console.log(activity);
      console.log('_file:');
      console.log(_file);
      Parse.Cloud.useMasterKey();
      return activity.save({file: _file});
    }).then(function(activity) {
      console.log('activity was saved');
      console.log(activity);
    }).fail(function(error) {
      console.log('error');
      console.log(error);
    }).always(function() {
      console.log('always');
    });
});
       
// Start the Express app
app.listen();

// Use Parse's RPC functionality to make an outbound call
Parse.Cloud.define('getToken', function(request, response) {
  // Create a Twilio REST API client - get your account SID and
  // auth token at https://www.twilio.com/user/account
  var client = new twilio.RestClient(
    twilioAccountSID,
    twilioAuthToken
  );
  var capability = new twilio.Capability(twilioAccountSID, twilioAuthToken);

  //Create a capability token using the TwiML app with sid 
  capability.allowClientOutgoing(twilioAppSID);

  var token = capability.generate();
  response.success(token);
});
