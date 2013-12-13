'use strict';

angular.module('fv')
  .controller('LoginCtrl', function ($scope, Auth, $location) {

    $scope.login = function() {
      Auth.login($scope.loginUser).then(function() {
        $location.path('/activities');
      }, function(response) {
        $scope.error = response.data.error;
      });
    };
 
  });
