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
    }
    $scope.hasFile = function() {
      return !_.isUndefined($scope.activity.get('file'));
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
  });
