'use strict';
angular.module('fv')
  .controller('ActivitiesUpdateCtrl', function ($scope, $routeParams, $timeout, $location, Activity, User, Family, requestNotificationChannel, player) {
    var self = this;
    $scope.player = player;
    $scope.recordingStarts = false;
    //if this is an edit request, it will have an objectId parameter
    if($routeParams.action ==='edit' && $routeParams.id || $routeParams.action ==='record' && $routeParams.id) {
      $scope.action = $routeParams.action;
      //find the activity
      (new Activity()).get($routeParams.id)
        .then(
          function(activity) {
            var _activity = new Activity(activity);
            $scope.activity = _activity;
          }, function(error) {
            console.log(error);
            return $location.path('/activities');
          });
      
    } else {
      if ($routeParams.action === 'add' && $routeParams.id) {
        User.get($routeParams.id)
          .then(
            function(familyUser) {
              $scope.user = familyUser;
              return (new Family()).isFamily(familyUser, Parse.User.current());
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
    };
    $scope.hasFile = function() {
      return ($scope.activity && $scope.activity.file);
    };
    $scope.submit = function() {
      if ($scope.roleForm.$valid) {
        requestNotificationChannel.requestStarted();
        $('#submitBtn').attr('disabled','disabled');
        $scope.activity.save($scope.photoFile)
          .then(
            function() {
              //In case user came from viewing someones activites
              window.history.back();
            },
            function(error) {
              $scope.error = error;
            })
        .finally(
          function() {
            $('#submitBtn').attr('disabled',false);
            requestNotificationChannel.requestEnded();
          });
      } else {
        $scope.roleForm.submitted = true;
      }
    };
    
    $scope.beginRecording = function() {
      $scope.recording = true;
      Twilio.Device.connect({activity: $scope.activity.id,
                             user: Parse.User.current().id});
    };

    $scope.stopRecording = function() {
      $scope.recording = false;
      $('#myTimer').hide();
      self.connection.sendDigits('#');
    };

    $scope.setFiles = function(element) {
      $scope.photo = element.files[0];
      //The directive resets the model so keep this safe
      $scope.photoFile = element.files[0];
    };

    $scope.showPicture = function() {
      $('#myModal').modal();
    };

    $scope.getPhoto = function() {
      return $scope.activity && !_.isNull($scope.activity.photo) && !_.isUndefined($scope.activity.photo) ?
        $scope.activity.photo._url
        :
        null;
    };

    $scope.getThumbnail = function() {
      return $scope.activity && !_.isNull($scope.activity.thumbnail) && !_.isUndefined($scope.activity.thumbnail) ?
        $scope.activity.thumbnail._url
        :
        null;
    };

    $scope.init = function() {
      $scope.photo = '';
      $('#myTimer').hide();
      $scope.recording = false;
      Parse.Cloud.run('getToken')
        .then(
          function(data) {
            console.log(data);
            Twilio.Device.setup(data,{'debug':true});
          });
      
    };
    $scope.back = function() {
      window.history.back();
    };

    var status = function(message) {
      console.log(message);
    };
    
    Twilio.Device.error(function (error) {
      status('error: ' + error.message);
    });

    Twilio.Device.connect(function(conn) {
      self.connection = conn;
      $timeout(function() {
        $('#myTimer').show();
        $scope.$broadcast('timer-start');
      },8500);
    });

    Twilio.Device.disconnect(function (conn) {
      self.connection = conn;
    });
  });
