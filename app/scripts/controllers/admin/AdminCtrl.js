'use strict';

angular.module('fv')
  .controller('AdminCtrl', function ($scope, Role, RoleCollection) {
    /**
     */
    $scope.init = function() {
      
      if(RoleCollection.size() === 0) {
        RoleCollection.query();
      }
      
      $scope.roles = RoleCollection.all();

    };
    $scope.setRole = function(index) {
      $scope.role = $scope.roles[index];
    }
    $scope.createUpdateRole = function() {
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
