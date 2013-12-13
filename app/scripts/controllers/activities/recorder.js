'use strict';

angular.module('fv')
  .controller('ActivitiesRecorderCtrl', function ($scope, $routeParams, $location, ActivityCollection, TagCollection, Activity, Tag, Auth) {
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
      $scope.recording = true;
      Twilio.Device.connect({activity: $scope.activity.objectId});
    }
    $scope.stopRecording = function() {
      $scope.recording = false;
      self.connection.sendDigits("#");
    }
    $scope.init = function() {
      $scope.recording = false;
      activity.$call('getToken',{}).then(function(data) {
        console.log(data);
        Twilio.Device.setup(data.result,{"debug":true});
      });
      
    }
    Twilio.Device.incoming(function(conn) {
      self.connection = conn;
    });
 
    Twilio.Device.ready(function (device) {
      $('#status').text('Ready to start recording');
    });
    
    Twilio.Device.offline(function (device) {
      $('#status').text('Offline');
    });
    
    Twilio.Device.error(function (error) {
      $('#status').text(error);
    });
    var params = { "Phone": $('#Phone').val(), "from":$('#Phone').val() };

    Twilio.Device.connect(function(conn) {
      self.connection = conn;
      $('#status').text("On Air");
      $('#status').css('color', 'red');
    });
    
    Twilio.Device.disconnect(function (conn) {
      self.connection = conn;
      console.log('disconnect');
      console.log(conn);
      $('#status').html('Recording ended');
      $('#status').css('color', 'black');
    });
  });

