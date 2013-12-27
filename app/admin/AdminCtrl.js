'use strict';

angular.module('fv')
  .controller('AdminCtrl', function ($scope, Role) {
    /**
     */
    $scope.init = function() {
      $scope.currentUser = Parse.User.current().get('primaryEmail');
      Role.list()
        .then(
          function(roles) {
            $scope.roles = roles;
          }, function(error) {
            console.log(error);
          });
    }

    $scope.setRole = function(index) {
      $scope.role = $scope.roles[index];
    }
    $scope.addCurrentUser = function() {
      console.log('addingCurrentUser');
      $scope.role.getUsers().add(Parse.User.current());
    }
   
    $scope.createUpdateRole = function() {
      var roleACL = new Parse.ACL();
      roleACL.setWriteAccess(Parse.User.current(), true);
      roleACL.setPublicReadAccess(true);
      var role = new Parse.Role($scope.role.name, roleACL);
      if ($scope.roleForm.$valid) {
        role.save()
          .then(function (savedRole) {
            console.log(savedRole);
            savedRole.getUsers().add(Parse.User.current());
            return savedRole.save();
          })
          .then(function(final) {
            console.log(final.getUsers().toJSON());
          }, function(error) {
            console.log('role save failed');
            console.log(error);
          });
      } else {
        $scope.roleForm.submitted = true;
      }

    }

  });
