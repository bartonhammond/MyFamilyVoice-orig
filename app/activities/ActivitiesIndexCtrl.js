'use strict';

angular.module('fv')
  .controller('ActivitiesIndexCtrl', function ($scope, $routeParams, $location, Activity, User, Family) {
    $scope.user = '';
    $scope.family = '';
    var getUsersActivities = function(user) {
      (new Activity()).list(user)
        .then(
          function(activities) {
            var _activities = [];
            _.each(activities, function(act) {
              _activities.push(new Activity(act));
            });
            $scope.activities = _activities;
          },
          function(error) {
            console.log(error.message);
            window.history.back();
          });
    };

    $scope.init = function() {
      //id is set when viewing Activities for a specific user
      if ($routeParams.id) {
        User.get($routeParams.id)
          .then(
            function(familyUser) {
              $scope.user = familyUser;
              return (new Family()).isFamily(familyUser, Parse.User.current());
            })
          .then(
            function(family) {
              $scope.family = family;
              getUsersActivities($scope.user);
            },
            function(error) {
              console.log(error.message);
              window.history.back();
            });
      } else {
        $scope.user = Parse.User.current();
        getUsersActivities(Parse.User.current());
      }

    };
    $scope.doesUserHaveWriteAccess = function() {
      if (Parse.User.current() && $scope.user) {
        return Parse.User.current().id === $scope.user.id || $scope.family;
      } else {
        return false;
      }
    };
    $scope.isOwner = function(index) {
      var activity = $scope.activities[index];
      var ownerId = activity.activity.get('user').id;
      return ownerId === Parse.User.current().id;
    };

    $scope.hasWriteAccess = function(index) {
      var activity = $scope.activities[index];
      return activity.getACL().getWriteAccess(Parse.User.current().id);
    };
    
    //file contains 'http:...' and the : causes problems
    $scope.hasThumbnail = function(index) {
      var activity = $scope.activities[index];
      return !_.isUndefined(activity.thumbnail);
    };
    
    //file contains 'http:...' and the : causes problems
    $scope.hasFile = function(index) {
      var activity = $scope.activities[index];
      return !_.isUndefined(activity.file);
    };

    $scope.edit = function(activity) {
      $location.path('/activities/edit/' + activity.id);
    };

    $scope.record = function(activity) {
      $location.path('/activities/record/' + activity.id);
    };

    $scope.newQuestion = function() {
      if ($scope.family) {
        $location.path('/activities/add/'+ $scope.family.get('family').id);
      } else {
        $location.path('/activities/add');
      }
    };

    //delete from parse and remove from the collection
    $scope.delete = function(activity) {
      console.log(activity);
      console.log('delete not implemented');
    };
  });
