'use strict';

angular.module('parseApp')
  .controller('ActivitiesRecorderCtrl', function ($scope, $routeParams, $location, ActivityCollection, TagCollection, AudioCollection, Activity, Tag, Audio,  Auth) {
    var self = this;
    // variables
    self.connection = null;

    //if this is an edit request, it will have an objectId parameter
    if($routeParams.id) {
      //if the collection is empty query parse
      if(ActivityCollection.size() === 0) {
        ActivityCollection.query({
          //include: 'tags',
          where: {
            user: {
              '__type': 'Pointer',
              'className': '_User',
              'objectId': Auth.me().objectId
            }
          }
        });
      }

      //let's find the activity object from our collection of activities
      var activity = ActivityCollection.getByObjectId($routeParams.id);

      if(!activity) {
        return $location.path('/activities');
      }

      $scope.activity = activity;

    }
    $scope.beginRecording = function() {
      Twilio.Device.connect();
    }
    $scope.stopRecording = function() {
      self.connection.sendDigits("#");
    }
    $scope.init = function() {
      debugger;
      var audio = Audio.create({});
      audio.$call('getToken',{}).then(function(data) {
        console.log(data);
        Twilio.Device.setup(data.result,{"debug":true});
      });
      
    }
    
    Twilio.Device.ready(function (device) {
      $('#status').text('Ready to start recording');
    });
    
    Twilio.Device.offline(function (device) {
      $('#status').text('Offline');
    });
    
    Twilio.Device.error(function (error) {
      $('#status').text(error);
    });
    
    Twilio.Device.connect(function (conn) {
      self.connection=conn;
      $('#status').text("On Air");
      $('#status').css('color', 'red');
    });
    
    Twilio.Device.disconnect(function (conn) {
      $('#status').html('Recording ended');
      $('#status').css('color', 'black');
    });
    
    $scope.callBarton = function() {
      var audio = Audio.create({});
      audio.$call('makeCall',{to: '+15124965578'}).then(function(data) {
        console.log(data);
      });
      
    }

    //save this activity
    $scope.save = function() {
      $('#output').innerHTML = 'Saving...';
      var blob;
      if ($scope.$$phase || $scope.$root.$$phase) {
        blob = $scope.$eval(self.capture);
      } else {
        blob = $scope.$apply(self.capture);
      }

      
      var audio = Audio.create({});
      audio.file = blob;
      audio.date = new Date();

      audio.$saveFile('audio.wav.',blob, {type: 'audio/wav'}).then(function(data) {
        //add it to the collectio
        AudioCollection.add(audio);
        var activity = $scope.activity;
        activity.file = data.url;
        activity.recoredDate = audio.date;
        activity.$put().then(function() {
          $location.path('/activities');
        });
      });
    }
  });

