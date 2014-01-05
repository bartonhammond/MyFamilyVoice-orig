'use strict';

angular.module('fv')
  .controller('ActivitiesUpdateCtrl', function ($scope, $routeParams, $location, Activity, User, Family) {

    //if this is an edit request, it will have an objectId parameter
    if($routeParams.action ==='edit' && $routeParams.id
      ||
      $routeParams.action ==='record' && $routeParams.id) {
      $scope.action = $routeParams.action;
      //let's find the activity object from our collection of activities
      (new Activity()).get($routeParams.id)
        .then(
          function(activity) {
            var _activity = new Activity(activity);
            $scope.activity = _activity;
          }, function(error) {
            return $location.path('/activities');
          });
      
    } else {
      if ($routeParams.action === 'add' && $routeParams.id) {
        User.get($routeParams.id)
          .then(
            function(familyUser) {
              $scope.user = familyUser;
              return (new Family()).isFamily(familyUser, Parse.User.current())
            })
          .then(
            function(family) {
              $scope.family = family;
              //this is a new entry, create a new
              //activity object
              var _Activity = Parse.Object.extend('Activity');
              var _activity = new _Activity();
              //Family user is owner
              _activity.set('user', $scope.user);
              var acl = new Parse.ACL();
              acl.setPublicReadAccess(true);
              acl.setWriteAccess($scope.user.id,true);
              //Kin has write access
              acl.setWriteAccess(Parse.User.current().id,true);
              _activity.setACL(acl);
              
              var activity = new Activity(_activity);
              $scope.activity = activity;
            },
            function(error) {
              console.log(error.message);
              window.history.back();
            });
      } else {
        //this is a new entry, create a new
        //activity object
        var _Activity = Parse.Object.extend('Activity');
        var _activity = new _Activity();
        _activity.set('user', Parse.User.current());
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setWriteAccess(Parse.User.current().id,true);
        _activity.setACL(acl);

        var activity = new Activity(_activity);
        $scope.activity = activity;
      }
    }
    $scope.isRecording = function() {
      return $scope.action === 'record';
    }
    $scope.hasFile = function() {
      return ($scope.activity && $scope.activity.file);
    }
    $scope.submit = function() {
      $scope.activity.save()
      .then(
        function(activity) {
          //In case user came from viewing someones activites
          window.history.back();
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
