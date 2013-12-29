'use strict';

angular.module('fv')
  .controller('ActivitiesIndexCtrl', function ($scope, $routeParams, $location, Activity, User) {
    $scope.user = "";
    $scope.init = function() {
      var id;
      //id is set when viewing Activities for a specific user
      if ($routeParams.id) {
        id = $routeParams.id;
      } else {
        id = Parse.User.current().id;
      }

      User.get(id)
        .then(
          function(user) {
            $scope.user = user;
            return Activity.list(user);
          })
        .then(
          function(activities) {
            $scope.activities = activities;
          },
          function(error) {
            window.history.back();
          });
    }
    $scope.hasWriteAccess = function(index) {
      var activity = $scope.activities[index];
      return activity.getACL().getWriteAccess(Parse.User.current().id);
    }
    //file contains "http:..." and the : causes problems
    $scope.hasFile = function(index) {
      var activity = $scope.activities[index];
      return !_.isUndefined(activity.file);
    }
    $scope.edit = function(activity) {
      $location.path('/activities/edit/' + activity.id);
    }
    $scope.record = function(activity) {
      $location.path('/activities/record/' + activity.id);
    }
    $scope.newQuestion = function() {
      $location.path('/activities/add');
    }

    //delete from parse and remove from the collection
    $scope.delete = function(activity) {
      activity.$delete().then(function() {
        ActivityCollection.remove(activity);
      });
    }
  });
