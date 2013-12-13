'use strict';

angular.module('fv')
  .controller('MainCtrl', function ($scope, Auth, $location) {

    $scope.login = function() {
      Auth.login($scope.loginUser).then(function() {
        $location.path('/activities');
      }, function(response) {
        $scope.error = response.data.error;
      });
    };

    $scope.register = function () {
      Auth.register($scope.registerUser).then(function(){
        $location.path('/activities');
      }, function(response) {
        $scope.error = response.data.error;
      });
    };

  });
