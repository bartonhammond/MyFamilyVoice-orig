'use strict';

angular.module('fv')
  .controller('SearchCtrl', function ($scope, $location, User) {
    $scope.init = function() {
      $scope.search = {};
      $scope.search.q = '';
      $scope.performSearch();
    };

    $scope.performSearch = function() {
      User.create({}).$call('search', $scope.search.q).then(
        function(response) {
          $scope.search.items = response.result;
          console.log(response);
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
