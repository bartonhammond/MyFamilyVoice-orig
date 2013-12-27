// Include Cloud Code module dependencies
var express = require('express'),
twilio = require('twilio');
var url = require('url');
var _ = require('underscore');
var lr = require('cloud/loginradius.js');
var Buffer = require('buffer').Buffer;
var moment = require('moment');

//Twilio
var twilioAccountSID =  'AC5be60567ea132f150762244ccf788ae6';
var twilioAuthToken = '42420dd155a5997e75882993599a2d25';
var twilioAppSID = 'AP8302a09988efdeb8e14ab812b71eb790';

//loginRadius
var loginRadiusAPIKey = 'cf3d185d-0ab6-45f1-9b52-d62cb26157ac';
var loginRadiusAPISecret = '324c8612-7ef3-41ca-8fc1-8b89f182be61';

//Mandrill
var mandrillKey = '4BjxT9QwZCAb-vs1IlON-g';

var Activity = Parse.Object.extend('Activity');
var CallSid = Parse.Object.extend('CallSid');
var RegisterUser = Parse.Object.extend('RegisterUser');
var ConfirmEmail = Parse.Object.extend('ConfirmEmail');

/**
 * configure Express
 */
function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

// Create an Express web app (more info: http://expressjs.com/)
var app = express();
app.use(logErrors);
app.use(express.bodyParser());

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
  console.log('refererData.user: ' + refererData.user);

  var callSid = new CallSid();
  callSid.save({
    sid: queryData.RecordingSid,
    activity: refererData.activity,
    user: refererData.user
  }, {
    success: function() {
      console.log('makeSid: callSid saved');
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
 * Update user recording count if new recording
 */
var updateUserRecordingCount = function(user, activity) {
  console.log('updateUserRecordingCount');
  console.log(user);
  console.log(activity);
  var audio = activity.get('file');

  if (audio) {
    console.log('updateUserRecordingCount re-recording');
    return user;
  } else {
    console.log('updateUserRecordingCount new recording');
    Parse.Cloud.useMasterKey();
    user.increment('recordings');
    return user.save();
  }
};
/**
 * Update activity with file of recording
 */
var updateActivity = function(activity,file) {
  return activity.save({file: file, 
                        recordedDate: new Date()
                       });
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
  console.log('findSid');
  var parseQueryString = true;
  var refererData = url.parse(request.headers.referer, parseQueryString).query;
  console.log('sid: ' + refererData.RecordingSid);
  var query = new Parse.Query(CallSid);   
  query.equalTo("sid", refererData.RecordingSid);
  var promise = new Parse.Promise();

  query.find()
    .then(function(results) {
      var sid = results[0];
      console.log('findSid: sid:');
      console.log(sid);
      promise.resolve(sid);
    }, function(error) {
      console.log('findSid error:');
      console.log(error);
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
      console.log('ending thanks');
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
  console.log('in /callback');
  
  Parse.Promise.when([findSid(request),
                      getWave(request)])
     .then(
       function(sid, httpResponse) {
         console.log('callback sid');
         console.log(sid);
         console.log('userId: ' + sid.get('user'));
         return Parse.Promise.when([saveWave(httpResponse),
                                    findUser({userId: sid.get('user')}),
                                    findActivity(sid.get('activity'))
                                   ]);
       })
    .then(
     function(file, user, activity) {
       console.log('callback file, user, activity');
       console.log(file);
       console.log(user)
       console.log(activity);
       return Parse.Promise.when([
         updateUserRecordingCount(user, activity),
         updateActivity(activity, file)
       ]);
     })
    .then(
      function(userUpdate, activityUpdate) {
        console.log('callback: userUpdate and activityUpdate result');
        console.log(userUpdate);
        console.log(activityUpdate);
        response.send('ok');
      },
      function(error){
        console.log('callback error on updateActivity:');
        console.log(error);
        response.error(error);
      });
});
/**
 * The callback from LoginRadius
 * see https://www.loginradius.com/account/manage
 */
app.post('/logincallback/', function(request, response) {
  console.log('logincallback');
  lr.loginradiusauth(request.body.token ,loginRadiusAPISecret,function(isauthenticated,profile) {
    if(isauthenticated){
      response.write(profile);
    } else {
      response.write('not logged in');
    }
    response.end();
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
/**
 *
 */
var guid = function(){
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random()*16)%16 | 0;
    d = Math.floor(d/16);
    return (c=='x' ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
};

/**
 * Create registerUser
 */
var createRegisterUser = function(request, response) {
  console.log('createRegisterUser:');
  var user = JSON.parse(request.body);
  console.log('user:');
  console.log(user);
  var email = _.find(user.Email,function(address) {
    return address.Type === 'Primary';
  });
  
  var registerUser = new RegisterUser();
  Parse.Cloud.useMasterKey();
  return registerUser.save({
    provider: user.Provider,
    providerId: user.ID,
    firstName: user.FirstName,
    lastName: user.LastName,
    primaryEmail: email ? email.Value : "",
    password: guid()
  });

};
/**
 * find registerUser
 */
var findRegisteredUser = function(request, response) {
  console.log('findRegisteredUser: ' );
  console.log(request.body);
  var user = JSON.parse(request.body);
  console.log(user);
  var query = new Parse.Query(RegisterUser);   
  query.equalTo("provider", user.Provider);
  query.equalTo("providerId", user.ID);
  var promise = new Parse.Promise();

  query.find()
    .then(function(results) {
      console.log('findRegisteredUser: results:');
      console.log(results);
      //Not found check
      if (results.length === 0) {
        promise.reject('register user not found');
      } else {
        var user = results[0];
        console.log('findRegisteredUser user:');
        console.log(user);
        promise.resolve(user);
      }
      
    }, function(error) {
      promise.reject(error);
    });
  return promise;

};
// Use Parse's RPC functionality to make an outbound call
Parse.Cloud.define('registerSocialLogin', function(request, response) {
  console.log(request);

  Parse.Promise.when([createRegisterUser(request,response)]).then(
    function(user) {
      console.log('getUUID createRegisterUser:');
      console.log(user);
      response.success(user);
    }, 
    function(error) {
      console.log('getUUID createRegisterUser error');
      console.log(error);
      response.error(error);
    });

});

/*
 * Find the registeredUser or error 
 */
Parse.Cloud.define('loginWithSocialLogin', function(request, response) {
  console.log('loginWithSocialLogin request');
  console.log(request);
  Parse.Promise.when([findRegisteredUser(request, response)]).then(
    function(user) {
      console.log('loginWithSocialLogin found user');
      console.log(user);
      response.success(user);
    },
    function(error) {
      response.error('Please register first');
    });
});
/**
 * Find user - expect request to be {userId: id}
 */
var findUser = function(request) {
  console.log('findUser request');
  console.log(request);
  var id = request.userId;
  console.log('findUser id: ' + id);
  var promise = new Parse.Promise();
  var query = new Parse.Query(Parse.User);
  query.get(id, {
    success: function(user) {
      console.log('findUser:');
      console.log(user);
      promise.resolve(user);
    },
    error: function(error) {
      console.log('findUser error');
      console.log(error);
      promise.reject(error);
    }
  });
  return promise;
}
/**
 * Find confirmEmai record and return it or error
 */
var findConfirmEmail = function(request) {
  console.log('findConfirmEmail request:');
  console.log(request);
  var link = JSON.parse(request.body);
  console.log('link: ' + link.link);
  var query = new Parse.Query(ConfirmEmail);   
  query.equalTo("link", link.link);
  var promise = new Parse.Promise();

  query.find()
    .then(function(results) {
      var link = results[0];
      console.log('findConfirmEmail link');
      console.log(link);
      promise.resolve(link);
    }, function(error) {
      promise.reject(error);
    });
  return promise;
};
/*
 * Confirm the email 
 */
Parse.Cloud.define('confirmEmail', function(request, response) {
  console.log('confirmEmail request');
  console.log(request);
  Parse.Promise.when([findConfirmEmail(request, response)])
    .then(
      function(link) {
        console.log('confirmEmail found link');
        console.log(link);
        var id = link.get('userId');
        return Parse.Promise.when([findUser({userId: id})]);
      })
    .then(
      function(user) {
        console.log('confirmEmail found user:');
        console.log(user);
        user.set('verifiedEmail', true);
        Parse.Cloud.useMasterKey();
        return user.save();
      })
    .then(
      function(updatedUser) {
        console.log('confirmEmail updated user');
        console.log(updatedUser);
        response.success();
      },
      function(error) {
        console.log('confirmEmail findConfirmEmail error');
        console.log(error);
        response.error(error);
      });
});
/**
 * Create email for confirmation
 */
var createConfirmEmail = function(user, response) {
  console.log('createConfirmEmail:');
  console.log('user:');
  console.log(user);
  var link = guid() + guid();
  link = link.replace(/-/g,"");
  var confirmEmail = new ConfirmEmail();
  Parse.Cloud.useMasterKey();
  return confirmEmail.save({
    userId: user.objectId,
    link: link
  });

};
// Use Parse's RPC functionality to make an outbound call
Parse.Cloud.define('sendConfirmEmail', function(request, response) {
  console.log('sendConfirmEmail user:');
  console.log(request);
  var user = JSON.parse(request.body);
  console.log(user);
  
  Parse.Promise.when([createConfirmEmail(user, response)]).then(
    function(confirmEmail) {
      console.log('sendConfirmEmail create');
      
      var link = "https://myfamilyvoice.com/master.html#/confirmEmail/" 
      link += confirmEmail.get('link');
      
      var params = {
        "key": mandrillKey,
        "template_name": "welcome",
        "template_content": [
          
        ],
        "message": {
          "to": [
            {
              "email": user.primaryEmail,
              "name":  user.firstName,
              "type": "to"
            }
          ],
          "inline_css": "true",
          "merge_vars": [
            {
              "rcpt": user.primaryEmail,
              "vars": [
                {
                  "name": "CONFIRMREGISTRATION",
                  "content": link
                }
              ]
            }
          ],
        },
        "async": true
      };
      Parse.Cloud.httpRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        url: 'https://mandrillapp.com/api/1.0/messages/send-template.json',
        body: params,
        success: function(data) {
          console.log('sendConfirmEmail success:');
          response.success(data);
        },
        error: function(error) {
          console.log('sendConfirmEmail error:');
          response.error(error);
        }
      });
    },
    function(error) {
      console.log('sendConfirmEmail error');
      console.log(error);
      response.error(error);

    });
});
/**
 * Find all users
 */
var findUsers = function(request) {
  var query = new Parse.Query(Parse.User);
  return query.find();
}
/**
 * Find all activities with audio
 */
var findActivities = function(request) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Activity);
  query.exists("file");
  return query.find();
}
/*
 * Search
 */
Parse.Cloud.define('search', function(request, response) {
  console.log('search request');
  console.log(request);
  Parse.Promise.when([findUsers(request), findActivities(request)]).then(
    function(users, activities) {
      console.log('search found users');
      console.log(users);
      console.log('search found activities');
      console.log(activities)
      var results = [];
      _.each(users,function(user, index) {
        console.log(user);
        var obj = {
          type: 'user',
          objectId: users[index].id,
          description: user.get('firstName') + ' ' + user.get('lastName'),
          active: moment(user.createdAt).fromNow(),
          views: user.get('recordings')
        };
        results.push(obj);
      });
      _.each(activities, function(activity,index) {
        var obj = {
          type: 'activity',
          objectId: activities[index].id,
          description: activity.get('comment'),
          active: moment(activity.get('recordedDate')).fromNow(),
          views: activity.get('views'),
          audio: activity.get('file')
        }
        results.push(obj);
      });

      response.success(results);
    },
    function(error) {
      response.error(error);
    });
});
/**
 * If user is saved with VerifiedEmail false, 
 * send Email Confirmation
*/
Parse.Cloud.afterSave(Parse.User, function(request) {
  query = new Parse.Query("Parse.User");

  if (!request.user.get('verifiedEmail')) {
    var user = {objectId : request.user.id,
                primaryEmail: request.user.get('primaryEmail'),
                firstName: request.user.get('firstName')};
    Parse.Cloud.run('sendConfirmEmail', user, {
      success: function(data) {
        console.log('afterSave Parse.User data: success');
      },
      error: function(error) {
        console.log('afterSave Parse.User error:');
        console.log(error);
      }
    });
  } else {
    console.log('afterSave Parse.User verifiedEmail is true');
  }
});
 
