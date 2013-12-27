'use strict';

angular.module('fv')
  .controller('SearchCtrl', function ($scope, $location, Search) {
    $scope.init = function() {
      $scope.search = {};
      $scope.search.q = '';
      $scope.performSearch();
    };

    $scope.performSearch = function() {
      Search.search($scope.search)
        .then(
          function(response) {
            $scope.search.items = response;
          },
          function(error) {
            console.log(error);
          });
    };
    
    $scope.edit = function(activity) {
      $location.path('/activities/edit/' + activity.objectId);
    };

    $scope.record = function(activity) {
      $location.path('/activities/record/' + activity.objectId);
    };

    $scope.newQuestion = function() {
      $location.path('/activities/add');
    };
    
  });
