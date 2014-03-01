'use strict';

angular.module('fv')
  .controller('StoryCtrl', function ($scope, User, Activity, fileReader, requestNotificationChannel) {
    
    var self = this;

    $scope.init = function(obj) {
      console.log('storyCtrl: init');
      console.log(obj);
      if (obj.type === 'user') {
        $scope.userJson = obj;
      } else {
        $scope.activityJson = obj;
      }
      
      $scope.$watch('userJson.hideAddStory',function(newVal) {
        if (_.isUndefined(newVal)) {
          return;
        }
        if (!newVal) {
          self.prepareActivity();
        }
      });

      $scope.$watch('activityJson.hideAddStory',function(newVal) {
        if (_.isUndefined(newVal)) {
          return;
        }
        if (!newVal) {
          self.getCurrentActivity();
        }
      });

    };
    $scope.getThumbnail = function() {
      return $scope.activity && !_.isNull($scope.activity.thumbnail) && !_.isUndefined($scope.activity.thumbnail) ?
        $scope.activity.thumbnail._url
        :
        null;
    };
    $scope.submit = function() {
      if ($scope.roleForm.$valid) {
        requestNotificationChannel.requestStarted();
        $('#submitBtn').attr('disabled','disabled');
        $scope.activity.save($scope.photoFile)
          .then(
            function() {
              if (!_.isUndefined($scope.userJson)) {
                $scope.userJson.hideAddStory = true;
              } else {
                $scope.activityJson.hideAddStory = true;
              }
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
    
    self.prepareActivity = function() {
      //Addiing story to someone else?
      if (!$scope.userJson.isSelf) {
        (new User()).get($scope.userJson.userId)
          .then(
            function(user) {
              $scope.user = user;
              //this is a new entry, create a new
              //activity object
              var _Activity = Parse.Object.extend('Activity');
              var _activity = new _Activity();
              //$scope.user is owner
              _activity.set('user', $scope.user);
              _activity.set('liked',0);
              _activity.set('views',0);
              _activity.set('approved',false);
              var acl = new Parse.ACL();
              acl.setPublicReadAccess(true);
              acl.setWriteAccess($scope.user.id,true);
              //current user has write access
              acl.setWriteAccess(Parse.User.current().id,true);
              _activity.setACL(acl);
              
              var activity = new Activity(_activity);
              $scope.activity = activity;
            },
            function(error) {
              console.log(error.message);
            });
      } else {
        //Current user is creating Activity for self
        var _Activity = Parse.Object.extend('Activity');
        var _activity = new _Activity();
        _activity.set('user', Parse.User.current());
        _activity.set('approved',true);
        _activity.set('liked',0);
        _activity.set('views',0);
        var acl = new Parse.ACL();
        acl.setPublicReadAccess(true);
        acl.setWriteAccess(Parse.User.current().id,true);
        _activity.setACL(acl);
        
        var activity = new Activity(_activity);
        $scope.activity = activity;
      }
    };
    self.getCurrentActivity = function() {
      (new Activity()).get($scope.activityJson.objectId)
      .then(
        function(activity) {
          $scope.activity = new Activity(activity);
        },
        function(error) {
          console.log(error);
        });
    };
    /**
     * Set file for checking photo size and valid type 
     */
    $scope.setFiles = function(element) {
      $scope.photo = element.files[0];
      $scope.photoFile = element.files[0];
    };
    /*
     * Support for preview
     */
    $scope.getFile = function () {
      $scope.progress = 0;
      fileReader.readAsDataUrl($scope.file, $scope)
        .then(function(result) {
          $scope.imageSrc = result;
        });
    };

  });

