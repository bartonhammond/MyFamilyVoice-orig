// Include Cloud Code module dependencies
var express = require('express'),
twilio = require('twilio');
var url = require('url');
var _ = require('underscore');

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
* Create a Sid file to hold the relationship of the activity and 
* recording
*/
var makeSid = function(request, response) {
  console.log('in makeSid');
  var parseQueryString = true;
  var queryData = url.parse(request.url, parseQueryString).query;
  var refererData = url.parse(request.headers.referer, parseQueryString).query;

  //Save the recordSid for reference in callback

  console.log('RecordingSid: ' + queryData.RecordingSid);
  console.log('refererData.activity: ' + refererData.activity);

  var callSid = new CallSid();
  callSid.save({
    sid: queryData.RecordingSid,
    activity: refererData.activity
  }, {
    success: function() {
      response.success(queryData);
    },
    error: function(something, error) {
      response.error('MakeSid:sid not saved');
    }
  });
};
/**
* Save the recording 
*/
var saveWave = function(httpResponse) {
  console.log('saveWave');
  var file = new Parse.File('recording.mp3',{base64: httpResponse.buffer.toString('base64')});
  return file.save();
};
/**
* Get the wave from Twilio
*/
var getWave = function(request) {
  console.log('getWave');
  var parseQueryString = true;
  var refererData = url.parse(request.headers.referer, parseQueryString).query;
  console.log('getWave: recordingUrl:' + refererData.RecordingUrl);
  return Parse.Cloud.httpRequest({url: refererData.RecordingUrl + ".mp3"});
};

/**
 * Update activity w/ masterkey override
 */
var updateActivity = function(activity,file) {
  Parse.Cloud.useMasterKey()
  return activity.save({file: file});
};
/**
 * Find activity by id and return promise
 */
var findActivity = function(id) {
  console.log('findActivity: ' + id);
  Parse.Cloud.useMasterKey()

  var query = new Parse.Query(Activity);
  var promise = new Parse.Promise();
  query.get(id, {
    success: function(object) {
      promise.resolve(object);
    },
    error: function(object, error) {
      promise.reject(error);
    }
    
  });
  return promise;
};

/**
 * Find sid and return it or error
 */
var findSid = function(request) {
  var parseQueryString = true;
  var refererData = url.parse(request.headers.referer, parseQueryString).query;
  
  var query = new Parse.Query(CallSid);   
  query.equalTo("sid", refererData.RecordingSid);
  var promise = new Parse.Promise();

  query.find()
    .then(function(results) {
      var sid = results[0];
      console.log('findSid:');
      console.log(sid);
      promise.resolve(sid);
    }, function(error) {
      promise.reject(error);
    });
  return promise;
};

/**
 * The thanks recording
 */
app.get('/thanks', function(request, response) {
  // Create a TwiML response generator object
  //Make sure Sid is saved before responding to Twilio
  makeSid(request, {
    success: function(queryData) {
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
    }, 
    error: function(error) {
      response.error(error);
    }
  });

});

/**
 * At completion, move file form Twilio to Parse
 */
app.get('/callback', function(request, response) {
  // Create a TwiML response generator object
  console.log('in callback');
  var self = this;
  self.sid = null;
  self.file = null;
  self.request = request;

  Parse.Promise.when([findSid(request), getWave(request)]).then(
    function(sid, httpResponse) {// wave){
      console.log('callback sid');
      console.log(sid);
      self.sid = sid;
      Parse.Promise.when([findActivity(sid.get('activity')), saveWave(httpResponse)]).then(
        function(activity, file) {
          console.log('callback file & activity');
          console.log(activity);
          console.log(file);
          Parse.Promise.when([updateActivity(activity, file)]).then(
            function(result) {
              console.log(result);
              response.send('ok');
            });
        }
      )
    }
  );
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
