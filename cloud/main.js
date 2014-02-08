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

var CallSid = Parse.Object.extend('CallSid');
var Activity = Parse.Object.extend('Activity');
var RegisterUser = Parse.Object.extend('RegisterUser');
var ConfirmEmail = Parse.Object.extend('ConfirmEmail');
var Family = Parse.Object.extend('Family');
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
    .record({action:'/thanks',
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
  console.log('findSid');
  var parseQueryString = true;
  var refererData = url.parse(request.headers.referer, parseQueryString).query;
  console.log('sid: ' + refererData.RecordingSid);
  var query = new Parse.Query(CallSid);
  query.equalTo('sid', refererData.RecordingSid);
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
 * Find user - expect request to be {userId: id}
 */
var findUser = function(request) {
  var id = request.userId;
  var promise = new Parse.Promise();
  var query = new Parse.Query(Parse.User);
  query.get(id, {
    success: function(user) {
      promise.resolve(user);
    },
    error: function(error) {
      promise.reject(error);
    }
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
    password: guid()
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
      var link = config.accounts.site + '/master.html#/confirmEmail/';
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
 * Find all users
 */
var findUsers = function() {
  var query = new Parse.Query(Parse.User);
  return query.find();
};
/**
 * Find all activities with audio
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
  console.log('findSubscriptions userId: ' + request.user.id);
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
  return promise;
};
/**
 * Find all families of any status for logged in user
 */
var findFamilies = function(request) {
  var promise = new Parse.Promise();
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
          console.log(family);
          if (family.get('approved')) {
            familyStatus = 2;
          } else {
            familyStatus = 1; //pending
          }
        }

        var obj = {
          type: 'user',
          objectId: users[index].id,
          isSelf: users[index].id === request.user.id,
          familyStatus: familyStatus,
          isSubscribed: _.any(subscriptions, function(subscription) {
            return users[index].id === subscription.get('family').id;
          }),
          thumbnail: user.get('thumbnail'),
          description: user.get('firstName') + ' ' + user.get('lastName'),
          active: moment(user.createdAt).fromNow(),
          recordings: user.get('recordings'),
          viewed: user.get('viewed'),
          audioViews: user.get('audioViews')
        };
        results.push(obj);
      });
      _.each(activities, function(activity,index) {
        var obj = {
          type: 'activity',
          objectId: activities[index].id,
          userId: activities[index].get('user').id,
          userName: activities[index].get('user').get('firstName') + ' ' + activities[index].get('user').get('lastName'),
          thumbnail: activities[index].get('user').get('thumbnail'),
          description: activity.get('comment'),
          active: moment(activity.get('recordedDate')).fromNow(),
          views: activity.get('views'),
          audio: activity.get('file')
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

  findUser({userId: request.object.id})
  .then(
    function(user) {

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
    },
    function(error) {
      console.log('beforeSave user not found error:');
      console.log(error);
    })
    .always(
      function() {
        return scaleImage(request,response);
      });
});
/**
 * If user is saved with VerifiedEmail false, 
 * send Email Confirmation
*/
Parse.Cloud.afterSave(Parse.User, function(request) {
  if (!request.object.get('verifiedEmail')) {
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
  } else {
    console.log('afterSave Parse.User verifiedEmail is true');
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
 * Search
 */
Parse.Cloud.define('activityListened', function(request, response) {
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
      function() {
        response.success();
      },
      function(error) {
        console.log('activityListened error: ');
        console.log(error);
        response.error(error);
      });
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
  console.log('createFamily:');
  console.log('loggedOnUserId:' + loggedOnUser.id);
  console.log('familyUserId:' + familyUser.id);

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
          function() {
            promise.resolve('ok');
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
 *  Scale image for activity
 */
Parse.Cloud.beforeSave('Activity', function(request, response) {
  return scaleImage(request, response);
});
/**
 * When Family is saved the first time, send email to family
 * for confirmation
 */
Parse.Cloud.afterSave('Family', function(request) {
  console.log('Family after save');

  var isNew = _.isEqual(request.object.createdAt, request.object.updatedAt);
  var family = JSON.parse(JSON.stringify(request.object.get('family')));
  var kin = JSON.parse(JSON.stringify(request.object.get('kin')));
  var link = request.object.get('link');
 
  if (!isNew) {
    return;
  }
  //Send email for Family member confirmation
  Parse.Promise.when([findUser({userId: family.objectId}),
                     findUser({userId: kin.objectId})])
    .then(
      function(family, kin) {
        var url = config.accounts.site + '/master.html#/confirmFamily/'  + link;
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
            //
          },
          error: function(error) {
            console.log('sendConfirmFamily error:' + error.message);
          }
        });
      },
      function(error) {
        console.log('sendConfirmEmail error');
        console.log(error);
      });
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
