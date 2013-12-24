'use strict';

angular.module('fv')
  .controller('AdminCtrl', function ($scope, Auth, $location, RegisterUser) {
    /**
     */
    $scope.init = function() {

      console.log($scope);
    };
    $scope.createRole = function() {
      /*
      RegisterUser.create({}).$call('sendConfirmEmail').then(
        function(response) {
          console.log(response);
      }, function(error) {
        console.log(error);
      });
      */
      console.log('createRole');
      if ($scope.roleForm.$valid) {
      } else {
        $scope.roleForm.submitted = true;
      }

    }

  });
