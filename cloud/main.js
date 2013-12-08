
// Include Cloud Code module dependencies
var express = require('express'),
twilio = require('twilio');
var url = require('url');

var  twilioAccountSID =  'AC5be60567ea132f150762244ccf788ae6';
var  twilioAuthToken = '42420dd155a5997e75882993599a2d25';
var  twilioAppSID = 'AP8302a09988efdeb8e14ab812b71eb790';
var Activity = Parse.Object.extend('Activity');

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

  
  try {
    //Override ACL!
    Parse.Cloud.useMasterKey();
    console.log('activity: ' + refererData.activity);
    var activity = new Activity();
    activity.id = refererData.activity;
    activity.save({file: queryData.RecordingUrl});
  } catch(e) {
    console.log(e);
  }
    
  var twiml = new twilio.TwimlResponse();
  twiml.say('Thanks for your Family Voice recording. Here is what I heard',
            {voice:'alice', language:'en-GB'})
    .pause({ length: 1 })
    .play(queryData.RecordingUrl)
    .say('Goodbye',
         {voice:'alice', language:'en-GB'});

  // Render the TwiML XML document
  response.type('text/xml');
  response.send(twiml.toString());
  
});


// Start the Express app
app.listen();

// Use Parse's RPC functionality to make an outbound call
Parse.Cloud.define('makeCall', function(request, response) {
  // Create a Twilio REST API client - get your account SID and
  // auth token at https://www.twilio.com/user/account
  var client = new twilio.RestClient(
    'AC5be60567ea132f150762244ccf788ae6', // Account SID
    '42420dd155a5997e75882993599a2d25' // auth token
  );
  
  // Place an outbound call
  client.makeCall({
    to: request.params.to, // the number you wish to call
    from: '+15129611463', // a valid Twilio number you own
    url: 'https://familyvoice.parseapp.com/hello', // TwiML URL
    method: 'GET' // HTTP method with which to fetch the TwiML
  }, function(error, data) {
    // Handle the result of placing the outbound call
    if (error) {
      response.error(data);
    } else {
      response.success('call incoming!');
    }
  });
});
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
