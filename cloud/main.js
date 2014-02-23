'use strict';
/*jshint bitwise: false*/

// Include Cloud Code module dependencies
var config = require('cloud/config.js');
var lr = require('cloud/loginradius.js');
var mandrill = require('cloud/mandrill.js');

var express = require('express');
var twilio = require('twilio');
var url = require('url');
var _ = require('underscore');

var moment = require('moment');
var ParseImage = require('parse-image');

//Twilio
var twilioAccountSID =  config.accounts.twilio.accountSID;
var twilioAuthToken = config.accounts.twilio.authToken;
var twilioAppSID = config.accounts.twilio.appSID;

var Activity = Parse.Object.extend('Activity');
var CallSid = Parse.Object.extend('CallSid');
var ConfirmEmail = Parse.Object.extend('ConfirmEmail');
var Family = Parse.Object.extend('Family');
var Referral = Parse.Object.extend('Referral');
var RegisterUser = Parse.Object.extend('RegisterUser');
var Subscription = Parse.Object.extend('Subscription');
var SubscriptionJob = Parse.Object.extend('SubscriptionJob');
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
app.use(express.json());
app.use(express.urlencoded());
//app.use(express.bodyParser());
/**
 * The recording message
 *see: https://www.twilio.com/docs/howto/twilio-client-record
 */

app.get('/record', function(request, response) {
  // Create a TwiML response generator object
  var twiml = new twilio.TwimlResponse();
  
  twiml.say('Welcome to My Family Voice!  Please record your thoughts at the beep.',
            {voice:'alice', language:'en-GB'})
    .record({action:'/thanks',
             method:'GET',
             finishOnKey:'#',
             transcribeCallback: '/transcription',
             maxLength:'120'})
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
  var parseQueryString = true;
  var queryData = url.parse(request.url, parseQueryString).query;
  var refererData = url.parse(request.headers.referer, parseQueryString).query;

  //Save the recordSid for reference in callback
  var callSid = new CallSid();
  callSid.save({
    sid: queryData.RecordingSid,
    activity: refererData.activity,
    user: refererData.user
  }, {
    success: function() {
      response.success(queryData);
    },
    error: function(error) {
      response.error('MakeSid:sid not saved' + error.message);
    }
  });
};
/**
 * Save the recording 
 */
var saveWave = function(httpResponse) {
  var file = new Parse.File('recording.mp3',{base64: httpResponse.buffer.toString('base64')});
  return file.save();
};
/**
 * Get the wave from Twilio
 */
var getWave = function(request) {
  var parseQueryString = true;
  var refererData = url.parse(request.headers.referer, parseQueryString).query;
  return Parse.Cloud.httpRequest({url: refererData.RecordingUrl + '.mp3'});
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
  Parse.Cloud.useMasterKey();
  return activity.save({file: file,
                        recordedDate: new Date()
                       });
};
/**
 * Find activity by id and return promise
 */
var findActivity = function(id) {
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
  query.equalTo('sid', refererData.RecordingSid);
  var promise = new Parse.Promise();

  query.find()
    .then(function(results) {
      var sid = results[0];
      promise.resolve(sid);
    }, function(error) {
      promise.reject(error);
    });
  return promise;
};
/**
 * Find user - expect request to be {userId: id}
 */
var findUser = function(request) {
  var id = request.userId;
  var promise = new Parse.Promise();
  if (!id) {
    promise.resolve(null);
  } else {
    var query = new Parse.Query(Parse.User);
    query.get(id, {
      success: function(user) {
        promise.resolve(user);
      },
      error: function(error) {
        promise.reject(error);
      }
    });
  }
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
  Parse.Promise.when([findSid(request),
                      getWave(request)])
    .then(
      function(sid, httpResponse) {
        return Parse.Promise.when([saveWave(httpResponse),
                                   findUser({userId: sid.get('user')}),
                                   findActivity(sid.get('activity'))
                                  ]);
      })
    .then(
      function(file, user, activity) {
        return Parse.Promise.when([
          updateUserRecordingCount(user, activity),
          updateActivity(activity, file)
        ]);
      })
    .then(
      function() {
        response.send('ok');
      },
      function(error){
        console.log('callback error:');
        console.log(error);
        response.send(error);
      });
});
/**
 * Twilio call back w/ transcribed text
 */
app.post('/transcription', function(request, response) {
  var query = new Parse.Query(CallSid);
  query.equalTo('sid', request.body.RecordingSid);
  query.first()
    .then(
      function(callSid) {
        return findActivity(callSid.get('activity'));
      })
    .then(
      function(activity) {
        Parse.Cloud.useMasterKey();
        return activity.save({
          transcription: request.body.TranscriptionText
        });
      })
    .then(
      function() {
        response.send('ok');
      },
      function(error){
        response.send(error);
      });
});

/**
 * The callback from LoginRadius
 * see https://www.loginradius.com/account/manage
 */
app.post('/logincallback/', function(request, response) {
  lr.loginradiusauth(request.body.token ,config.accounts.loginRadius.apiSecret,function(isauthenticated,profile) {
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
  var capability = new twilio.Capability(twilioAccountSID, twilioAuthToken);

  //Create a capability token using the TwiML app with sid 
  capability.allowClientOutgoing(twilioAppSID);
  capability.allowClientIncoming('alice');

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
    return (c==='x' ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
};

/**
 * Create registerUser
 */
var createRegisterUser = function(request) {
  var user = JSON.parse(request.body);
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
    primaryEmail: email ? email.Value : '',
    password: guid(),
    username: guid()
  });

};
/**
 * find registerUser
 */
var findRegisteredUser = function(request) {
  var user = JSON.parse(request.body);
  var query = new Parse.Query(RegisterUser);
  query.equalTo('provider', user.Provider);
  query.equalTo('providerId', user.ID);
  var promise = new Parse.Promise();

  query.find()
    .then(function(results) {
      //Not found check
      if (results.length === 0) {
        promise.reject('register user not found');
      } else {
        var user = results[0];
        promise.resolve(user);
      }
      
    }, function(error) {
      promise.reject(error);
    });
  return promise;

};
// Use Parse's RPC functionality to make an outbound call
Parse.Cloud.define('registerSocialLogin', function(request, response) {
  Parse.Promise.when([createRegisterUser(request,response)]).then(
    function(user) {
      response.success(user);
    },
    function(error) {
      response.error(error);
    });

});

/*
 * Find the registeredUser or error 
 */
Parse.Cloud.define('loginWithSocialLogin', function(request, response) {
  Parse.Promise.when([findRegisteredUser(request, response)]).then(
    function(user) {
      response.success(user);
    },
    function() {
      response.error('Please register first');
    });
});
/**
 * Find confirmEmai record and return it or error
 */
var findConfirmEmail = function(request) {
  console.log('findConfirmEmail request:');
  console.log(request);
  var link = JSON.parse(request.body);
  console.log('link: ' + link.link);
  var query = new Parse.Query(ConfirmEmail);
  query.equalTo('link', link.link);
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
var createConfirmEmail = function(user) {
  var link = guid() + guid();
  link = link.replace(/-/g,'');
  var confirmEmail = new ConfirmEmail();
  Parse.Cloud.useMasterKey();
  return confirmEmail.save({
    userId: user.objectId,
    primaryEmail: user.primaryEmail,
    link: link,
    processed: false
  });

};
/**
 * Use Parse's RPC functionality to make an outbound call
 */
Parse.Cloud.define('sendConfirmEmail', function(request, response) {
  var user = JSON.parse(request.body);
  
  Parse.Promise.when([createConfirmEmail(user, response)]).then(
    function(confirmEmail) {
      var link = config.accounts.site + 'confirmEmail/';
      link += confirmEmail.get('link');
      
      var params = {
        'key': mandrill.config.key,
        'template_name': mandrill.config.welcome,
        'template_content': [
          
        ],
        'message': {
          'to': [
            {
              'email': user.primaryEmail,
              'name':  user.firstName,
              'type': 'to'
            }
          ],
          'inline_css': 'true',
          'merge_vars': [
            {
              'rcpt': user.primaryEmail,
              'vars': [
                {
                  'name': 'CONFIRMREGISTRATION',
                  'content': link
                }
              ]
            }
          ],
        },
        'async': true
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
 * Find the referral record by id
*/
var getReferral = function(id) {
  Parse.Cloud.useMasterKey();
  var promise = new Parse.Promise();
  var query = new Parse.Query(Referral);
  query.include('user');

  query.get(id,
            function(referral) {
              promise.resolve(referral);
            },
            function(error) {
              promise.reject(error);
            });

  return promise;
};
/**
 * Find the referral record by link
*/
var getReferralByLink = function(link) {
  Parse.Cloud.useMasterKey();
  var promise = new Parse.Promise();
  var query = new Parse.Query(Referral);
  query.equalTo('link',link);
  query.include('referredUser');

  query.first(
            function(referral) {
              promise.resolve(referral);
            },
            function(error) {
              promise.reject(error);
            });

  return promise;
};

/**
o * Send referral email
 */
Parse.Cloud.define('sendReferralEmail', function(request, response) {
  var referralId = request.params.id;
  Parse.Promise.when([getReferral(referralId)])
    .then(
      function(origReferral) {
        return origReferral.save({
          emailSent: new Date()
        });
      })
    .then(
      function(referral) {
        var link = config.accounts.site + 'login/';
        link += referral.get('link');
        
        var params = {
          'key': mandrill.config.key,
          'template_name': mandrill.config.referral,
          'template_content': [
          ],
          'message': {
            'to': [
              {
                'email': referral.get('email'),
                'name':  referral.get('firstName'),
                'type': 'to'
              }
            ],
            'inline_css': 'true',
            'merge_vars': [
              {
                'rcpt': referral.get('email'),
                'vars': [
                  {
                    'name': 'REFERRALLINK',
                    'content': link
                  },
                  {
                    'name': 'REFERRALFIRSTNAME',
                    'content': referral.get('firstName')
                  },
                  {
                    'name': 'FIRSTNAME',
                    'content': referral.get('user').get('firstName')
                  },
                  {
                    'name': 'LASTNAME',
                    'content': referral.get('user').get('lastName')
                  }
                ]
              }
            ],
          },
          'async': true
        };
        Parse.Cloud.httpRequest({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          url: 'https://mandrillapp.com/api/1.0/messages/send-template.json',
          body: params,
          success: function() {
            response.success(referral);
          },
          error: function(error) {
            response.error(error);
          }
        });
      },
      function(error) {
        console.log('sendReferralEmail error');
        console.log(error);
        response.error(error);
        
      });
});

/**
 * Find all users
 */
var findUsers = function() {
  var query = new Parse.Query(Parse.User);
  return query.find();
};
/**
 * Find all activities with audio
 * client code will retrieve likes
 */
var findActivities = function() {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query(Activity);
  query.exists('file');
  query.include('user');
  return query.find();
};
/**
 * Find all families approved for logged in user
 */
var findSubscriptions = function(request) {
  var promise = new Parse.Promise();
  //If user is not logged in
  if (request.user) {
    findUser({userId: request.user.id})
      .then(
        function(user) {
          var query = new Parse.Query(Subscription);
          query.equalTo('subscriber', user);
          query.equalTo('approved', true);
          return query.find();
        })
      .then(
        function(results) {
          promise.resolve(results);
        },
        function(error) {
          promise.reject(error);
        });
  } else {
    promise.resolve([]);
  }
  return promise;
};
/**
 * Find all families of any status for logged in user
 */
var findFamilies = function(request) {
  var promise = new Parse.Promise();
  //When search is performed w/o logged in user
  if (request.user) {
    findUser({userId: request.user.id})
      .then(
        function(user) {
          var query = new Parse.Query(Family);
          query.equalTo('kin', user);
          return query.find();
        })
      .then(
        function(results) {
          promise.resolve(results);
        },
        function(error) {
          promise.reject(error);
        });
  } else {
    promise.resolve([]);
  }
  return promise;
};
/*
 * Search
 */
Parse.Cloud.define('search', function(request, response) {
  Parse.Promise.when([findUsers(request),
                      findActivities(request),
                      findFamilies(request),
                      findSubscriptions(request)])
    .then(
      function(users, activities, families, subscriptions) {
      var results = [];
      _.each(users,function(user, index) {
        var family = _.find(families, function(family) {
          return users[index].id === family.get('family').id;
        });
        
        var familyStatus = 0; //no request pending 
        if (family) {
          if (family.get('approved')) {
            familyStatus = 2;
          } else {
            familyStatus = 1; //pending
          }
        }
        var isSelf = false;
        //If no logged in user
        if (request.user && users[index].id === request.user.id) {
          isSelf = true;
        }
        var obj = {
          type: 'user',
          objectId: users[index].id,
          isSelf: isSelf,
          familyStatus: familyStatus,
          isSubscribed: _.any(subscriptions, function(subscription) {
            return users[index].id === subscription.get('family').id;
          }),
          thumbnail: user.get('thumbnail'),
          photo: user.get('photo'),
          description: user.get('firstName') + ' ' + user.get('lastName'),
          active: moment(user.createdAt).fromNow(),
          recordings: user.get('recordings'),
          viewed: user.get('viewed'),
          audioViews: user.get('audioViews')
        };
        results.push(obj);
      });

      _.each(activities, function(activity,index) {
        var thumbnail, photo;
        if (!_.isNull(activities[index].get('thumbnail')) &&
            !_.isUndefined(activities[index].get('thumbnail'))) {
          thumbnail = activities[index].get('thumbnail');
          photo = activities[index].get('photo');
        } else if (!_.isNull(activities[index].get('user').get('thumbnail')) &&
                   !_.isUndefined(activities[index].get('user').get('thumbnail'))) {
          thumbnail = activities[index].get('user').get('thumbnail');
          photo = activities[index].get('user').get('photo');
        }
            
        var obj = {
          type: 'activity',
          activity: activity,
          objectId: activities[index].id,
          userId: activities[index].get('user').id,
          username: activities[index].get('user').get('firstName') + ' ' + activities[index].get('user').get('lastName'),
          thumbnail: thumbnail,
          photo: photo,
          description: activity.get('comment'),
          active: moment(activity.get('recordedDate')).fromNow(),
          views: activity.get('views'),
          audio: activity.get('file'),
          liked: activity.get('liked'),
          isLikeCollapsed: true

        };
        results.push(obj);
      });

      response.success(results);
    },
    function(error) {
      response.error(error);
    });
});
/**
 * Create 
 */
var createReferredUser = function(email, firstName, lastName) {
  var link = guid();
  var user = new Parse.User();
  return user.save({
    primaryEmail: email,
    username: email,
    verifiedEmail: false,
    firstName: firstName,
    lastName: lastName,
    password: link,
    audioViews: 0,
    viewed: 0,
    referral: true
  });
    
};
/**
 * Scale thumbnail image
 */
var scaleImage = function(request, response) {
  var obj = request.object;
  
  if (!obj.get('photo')) {
    return response ? response.success() : null;
  }
  
  if (!obj.dirty('photo')) {
    return response ? response.success() : null;
  }
  
  Parse.Cloud.httpRequest({
    url: obj.get('photo').url()
  })
    .then(
    function(response) {
      var image = new ParseImage();
      return image.setData(response.buffer);
    })
    .then(function(image) {
      // Crop the image to the smaller of width or height.
      var size = Math.min(image.width(), image.height());
      return image.crop({
        left: (image.width() - size) / 2,
        top: (image.height() - size) / 2,
        width: size,
        height: size
      });
    })
    .then(
      function(image) {
        // Resize the image to 104x104
        return image.scale({
          width: 104,
          height: 104
        });
      })
    .then(
      function(image) {
        // Make sure it's a JPEG to save disk space and bandwidth.
        return image.setFormat('JPEG');
      })
    .then(
      function(image) {
        // Get the image data in a buffer.
        return image.data();
      })
    .then(
      function(buffer) {
        // Save the image into a new file.
        var base64 = buffer.toString('base64');
        var cropped = new Parse.File('thumbnail.jpg', { base64: base64 });
        return cropped.save();
      })
    .then(
      function(cropped) {
        // Attach the image file to the original object.
        Parse.Cloud.useMasterKey();
        obj.set('thumbnail', cropped);
      })
    .then(
      function() {
        return response ? response.success() : null;
      }, function(error) {
        return response ? response.error(error) : null;
      });
};
/**
 * Need to control the verifiedEmail
 * If an email confirmation came in, the flag would be set to true
 * But the user in the browser stil has the false flag
 * So if the database and request have same primaryEmail, and the flag
 * is verified, reset to verified.
 */
Parse.Cloud.beforeSave(Parse.User, function(request, response) {
  //if run before inttial save of user, user will not be found
  findUser({userId: request.object.id})
  .then(
    function(user) {
      if (!_.isNull(user)) {
        if (_.isEqual(user.get('primaryEmail'), request.object.get('primaryEmail'))) {
          //Email confirmation 
          if (!request.object.get('verifiedEmail')) {
            //Some other update is overwriting like the Account process
            //This happens when the email confirmation happens and the
            //user is logged in and therefore out of sync
            if (user.get('verifiedEmail')) {
              request.object.set('verifiedEmail',true);
            }
          }
          //If different, set verifiedEmail to false
        } else {
          request.object.set('verifiedEmail',false);
        }
      }
    },
    function(error) {
      console.log('beforeSave user not found error:');
      console.log(error);
    })
    .always(
      function() {
        return scaleImage(request, response);
      });
});



/**
 * If user is saved with VerifiedEmail false, 
 * send Email Confirmation
*/
Parse.Cloud.afterSave(Parse.User, function(request) {
  if (!request.object.get('referral') && !request.object.get('verifiedEmail')) {
    var user = {objectId : request.object.id,
                primaryEmail: request.object.get('primaryEmail'),
                firstName: request.object.get('firstName')};
   
    //Only Send Email if no outstanding request
    var query = new Parse.Query(ConfirmEmail);
    query.equalTo('userId', user.objectId);
    query.equalTo('primaryEmail', user.primaryEmail);
    query.equalTo('processed', false);
    query.find()
      .then(function(results) {
        if (results.length === 0) {
          Parse.Cloud.run('sendConfirmEmail', user, {
            success: function() {
              console.log('afterSave Parse.User data: success');
            },
            error: function(error) {
              console.log('afterSave Parse.User error:');
              console.log(error);
            }
          });
        } else {
          console.log('Existing email confirmation pending');
        }
      }, function(error) {
        console.log('afterSave - error finding ConfirmEmail');
        console.log(error);
      });
  }
});
var updateActivityViewsCount = function(activity) {
  activity.increment('views');
  Parse.Cloud.useMasterKey();
  return activity.save();
};
var updateActivitiesUserAudioViewCount = function(user) {
  Parse.Cloud.useMasterKey();
  user.increment('audioViews');
  return user.save();
};
var updateUserViewedCount = function(user) {
  Parse.Cloud.useMasterKey();
  user.increment('viewed');
  return user.save();
};

/*
 * Increment counts for listening to audi.
 * Activity, Activities user, and user who listened
 */
Parse.Cloud.define('activityListened', function(request, response) {
  console.log('activityListened userId: ' + request.params.userId);
  if (request.params.userId) {
    console.log('got userid');
    Parse.Promise.when([findActivity(request.params.activityId),
                        findUser({userId: request.params.activityUserId}),
                        findUser({userId: request.params.userId})])
      .then(
        function(activity, activityUser, user) {
          return Parse.Promise.when([updateActivityViewsCount(activity),
                                     updateActivitiesUserAudioViewCount(activityUser),
                                     updateUserViewedCount(user)]);
        })
      .then(
        function(activity) {
          response.success(activity);
        },
      function(error) {
        console.log('activityListened error: ');
        console.log(error);
        response.error(error);
      });
  } else {
    console.log('did not get userid');
    Parse.Promise.when([findActivity(request.params.activityId),
                        findUser({userId: request.params.activityUserId})])
      .then(
        function(activity, activityUser) {
          return Parse.Promise.when([updateActivityViewsCount(activity),
                                     updateActivitiesUserAudioViewCount(activityUser)]);
        })
      .then(
        function(activity) {
          response.success(activity);
        },
        function(error) {
          console.log('activityListened error: ');
          console.log(error);
          response.error(error);
        });
  }
});
/**
 * Create subscription record
 */
var createSubscription = function(loggedOnUser, familyUser, status) {
  var promise = new Parse.Promise();

  var query = new Parse.Query(Subscription);
  query.equalTo('family',familyUser);
  query.equalTo('subscriber', loggedOnUser);
  query.first()
    .then(
      function(subscription) {
        if (!subscription) {
          var subscripe = new Subscription();
          return subscripe.save({
            family: familyUser,
            subscriber: loggedOnUser,
            active: true
          });
        } else {
          return subscription.save({
            active: status
          });
        }
      })
    .then(
      function() {
        promise.resolve('ok');
      },function(error) {
        promise.reject(error);
      });
  
  return promise;
};
/**
 * Create family record
 */
var createFamily = function(loggedOnUser, familyUser) {
  var link = guid() + guid();
  link = link.replace(/-/g,'');

  var promise = new Parse.Promise();

  var query = new Parse.Query(Family);
  query.equalTo('family',familyUser);
  query.equalTo('kin', loggedOnUser);
  query.find()
    .then(function(results) {
      if (results.length === 0) {
        var family = new Family();
        family.save({
          family: familyUser,
          kin: loggedOnUser,
          link: link,
          approved: false
        })
        .then(
          function(family) {
            promise.resolve(family);
          });
      } else {
        console.log('createFamily: results');
        console.log(results);
        promise.resolve('ok');
      }
    },function(error) {
      promise.reject(error);
    });

  return promise;
};
/**
 * Subscribe to Family - the logged in user is joining the params.userId family
 */
Parse.Cloud.define('subscribeToFamily', function(request, response) {
  Parse.Promise.when([findUser({userId: request.user.id}),
                      findUser({userId: request.params.userId})])
    .then(
      function(loggedOnUser, familyUser) {
        return createSubscription(loggedOnUser,
                                  familyUser,
                                  request.params.status);
      })
    .then(
      function() {
        response.success();
      },
      function(error) {
        response.error(error);
      });
});
/**
 * When Family is saved the first time, send email to family
 * for confirmation
 */
var emailFamilyRequest  =  function(family,response) {
  console.log('emailFamilyRequest');

  var _family = family.get('family');
  var _kin = family.get('kin');
  var link = family.get('link');
 
  console.log('_family.id: ' + _family.id + ' _kin.id: ' + _kin.id);

  //Send email for Family member confirmation
  Parse.Promise.when([findUser({userId: _family.id}),
                     findUser({userId: _kin.id})])
    .then(
      function(family, kin) {
        var url = config.accounts.site + 'confirmFamily/'  + link;
        var params = {
          'key': mandrill.config.key,
          'template_name': mandrill.config.family,
          'template_content': [
          ],
          'message': {
            'to': [
              {
                'email': family.get('primaryEmail'),
                'name':  family.get('firstName'),
                'type': 'to'
              }
            ],
            'inline_css': 'true',
            'merge_vars': [
              {
                'rcpt': family.get('primaryEmail'),
                'vars': [
                  {
                    'name': 'CONFIRMFAMILYKIN',
                    'content': url
                  },
                  {
                    'name': 'FIRSTNAME',
                    'content': kin.get('firstName')
                  },
                  {
                    'name': 'LASTNAME',
                    'content': kin.get('lastName')
                  }
                ]
              }
            ],
          },
          'async': true
        };
        console.log(params);
        Parse.Cloud.httpRequest({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          url: 'https://mandrillapp.com/api/1.0/messages/send-template.json',
          body: params,
          success: function() {
            return response.success();
          },
          error: function(error) {
            return response.error(error);
          }
        });
      },
      function(error) {
        console.log('sendConfirmEmail error');
        console.log(error);
      });
};
/**
 * Join Family - the logged in user is joining the params.userId family
 */
Parse.Cloud.define('addToFamily', function(request, response) {
  Parse.Promise.when([findUser({userId: request.user.id}),
                      findUser({userId: request.params.userId})])
    .then(
      function(loggedOnUser, familyUser) {
        return createFamily(loggedOnUser, familyUser);
      })
    .then(
      function(family) {
        return emailFamilyRequest(family, response);
      },
      function(error) {
        response.error(error);
      });
});
/**
 * Create family record
 */
var createLikesRelation = function(user, activity, likes) {
  Parse.Cloud.useMasterKey();
  var likeRelation = activity.relation('likes');
  if (likes) {
    likeRelation.add(user);
    activity.increment('liked');
  } else {
    likeRelation.remove(user);
    activity.increment('liked',-1);
  }
  return activity.save();
};

/**
 * error or unlike an activity
 */
Parse.Cloud.define('activityLike', function(request, response) {
  Parse.Promise.when([findUser({userId: request.user.id}),
                      findActivity(request.params.activityId)])
    .then(
      function(user, activity) {
        return createLikesRelation(user, activity, request.params.like);
      })
    .then(
      function(activity) {
        console.log('activityLike: success');
        response.success(activity);
      },
      function(error) {
        console.log('activityLike: error');
        console.log(error);
        response.error(error);
      });
});
/**
* Return count of outstanding requests
*/
Parse.Cloud.define('unapprovedFamilyRequestCount', function(request,response) {
  findUser({userId: request.user.id})
    .then(
      function(user) {
        var query = new Parse.Query(Family);
        query.equalTo('family', user);
        query.equalTo('approved', false);
        return query.count();
      })
    .then(
      function(count) {
        response.success(count);
      },
      function(error) {
        console.log('unapprovedFamilyRequestCount error: ' + error.message);
        response.error(error);
      });
});
/**
 * Find confirmEmai record and return it or error
 */
var findConfirmFamily = function(request) {
  console.log('findConfirmFamily request:');
  console.log(request);
  var link = JSON.parse(request.body);
  console.log('link: ' + link.link);
  var query = new Parse.Query(Family);
  query.equalTo('link', link.link);
  var promise = new Parse.Promise();

  query.find()
    .then(function(results) {
      var link = results[0];
      console.log('findConfirmFamily link');
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
Parse.Cloud.define('confirmFamily', function(request, response) {
  Parse.Promise.when([findConfirmFamily(request, response)])
    .then(
      function(familyLink) {
        familyLink.set('approved',true);
        return familyLink.save();
      })
    .then(
      function() {
        response.success();
      },
      function(error) {
        response.error(error);
      });
});
/**
* Return count of outstanding requests
*/
Parse.Cloud.define('updateReferredUser', function(request,response) {
  getReferralByLink(request.params.link)
    .then(
      function(referral) {
        var user = referral.get('referredUser');
        Parse.Cloud.useMasterKey();
        if (request.params.isSocial) {
          return user.save({
            username: request.params.username,
            password: request.params.password,
            primaryEmail: request.params.primaryEmail,
            firstName: request.params.firstName,
            lastName: request.params.lastName,
            verifiedEmail: false,
            isSocial: request.params.isSocial
          });
        } else {
          return user.save({
            username: request.params.username,
            password: request.params.password,
            primaryEmail: request.params.username,
            verifiedEmail: false,
            isSocial: request.params.isSocial
          });
        }
      })
    .then(
      function(user) {
        console.log('updateReferredUser objectId: ' + user.id + ' primaryEmail: ' + user.get('primaryEmail') + ' firstName: ' + user.get('firstName'));
        Parse.Cloud.run('sendConfirmEmail', {objectId: user.id,
                                             primaryEmail: user.get('primaryEmail'),
                                             firstName: user.get('firstName')}, {
          success: function() {
            response.success(user);
          },
          error: function(error) {
            response.error(error);
          }
        });
      },
      function(error) {
        console.log('unapprovedFamilyRequestCount error: ' + error.message);
        response.error(error);
      });
});
/**
 *  Scale image for activity
 */
Parse.Cloud.beforeSave('Activity', function(request, response) {
  return scaleImage(request, response);
});

Parse.Cloud.job('sendSubscriberEmails', function(request, status) {
  console.log('sendSubscriberEmails input');
  var query = new Parse.Query(SubscriptionJob);
  query.first()
    .then(
      function(job) {
        console.log('sendSubscriberEmails job: ');
        if (!job) {
          var subJob = new SubscriptionJob();
          return subJob.save({lastJob: moment().startOf('year'),
                              thisRun: moment()});
          
        } else {
          return job.save({lastJob: job.thisRun,
                           thisRun: moment()});
        }
      })
    .then(
      function() {
        // Set the job's success status
        status.success('Migration completed successfully.');
      },
      function(error) {
        console.log('sendSubscriberEmails error: ' + error.message);
        // Set the job's error status
        status.error('Uh oh, something went wrong.');
      });
});
/*
 * Create referral
 * find the logged in user,
 * create a temp user,
 * create a referral
 * create a family
 */
Parse.Cloud.define('createReferral', function(request, response) {
  console.log('createReferral');
  console.log('email: ' + request.params.email);
  console.log('firstName: ' + request.params.firstName);
  console.log('lastName: ' + request.params.lastName);
  console.log('userId: ' + request.user.id);
  var _user, _referredUser;
  Parse.Promise.when([findUser({userId: request.user.id})])
    .then(
      function(user) {
        _user = user;
        return createReferredUser(request.params.email,
                                  request.params.firstName,
                                  request.params.lastName);
      })
    .then(
      function(referredUser) {
        _referredUser = referredUser;
        return createFamily(_user, referredUser);
      })
    .then(
      function(family) {
        return family.save({
          approved: true
        });
      })
    .then(
      function() { //approvedFamily not needed
        var referral = new Referral();
        return referral.save({
          firstName: request.params.firstName,
          lastName: request.params.lastName,
          email: request.params.email,
          link: guid() + guid(),
          user: _user,
          referredUser: _referredUser
        });
      })
    .then(
      function(referral) {
        response.success(referral);
      },
      function(error) {
        response.error(error);
      });
});
