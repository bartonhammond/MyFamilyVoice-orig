'use strict';

angular.module('fv')
  .controller('ActivitiesUpdateCtrl', function ($scope, $routeParams, $location, Activity) {

    //if this is an edit request, it will have an objectId parameter
    if($routeParams.action ==='edit' && $routeParams.id) {
      
      //let's find the activity object from our collection of activities
      Activity.get($routeParams.id)
        .then(
          function(activity) {
            $scope.activity = activity;
          }, function(error) {
            return $location.path('/activities');
          });
      
    } else {
      //this is a new entry, use today's date and create a new
      //activity object
      $scope.activity = new Activity();
      var acl = new ACL();
      acl.setPublicReadAccess(true);
      acl.setWriteAccess(Parse.User.current().id,true);
      $scope.activity.setACL(acl);
    }
    $scope.hasWriteAccess = function() {
      return activity.getACL().getWriteAccess(Parse.User.current().id);
    }
    $scope.hasFile = function() {
      if (_.isUndefined($scope.activity)) {
        return false;
      } else {
        return !_.isUndefined($scope.activity.get('file'));
      }
    }
    $scope.submit = function() {
      Activity.save($scope.activity)
      .then(
        function(activity) {
          return $location.path('/activities');
        },
        function(error) {
          $scope.error = error;
        });
    }
    $scope.beginRecording = function() {
      $scope.recording = true;
      Twilio.Device.connect({activity: $scope.activity.id,
                             user: Parse.User.current().id});
    }
    $scope.stopRecording = function() {
      $scope.recording = false;
      self.connection.sendDigits("#");
    }
    $scope.init = function() {
      $scope.recording = false;
      Parse.Cloud.run('getToken')
        .then(
          function(data) {
            console.log(data);
            Twilio.Device.setup(data,{"debug":true});
          });
      
    }
    $scope.back = function() {
      window.history.back();
    };
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
