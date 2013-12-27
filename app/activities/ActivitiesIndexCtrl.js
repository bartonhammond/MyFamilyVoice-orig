'use strict';

angular.module('fv')
  .controller('ActivitiesIndexCtrl', function ($scope, $location, Activity) {
    $scope.init = function() {
      Activity.list()
      .then(
        function(activities) {
          $scope.activities = activities;
        });
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
