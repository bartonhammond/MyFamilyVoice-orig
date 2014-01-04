'use strict';

angular.module('fv')
  .controller('AdminCtrl', function ($scope, Role) {
    /**
     */
    $scope.init = function() {
      (new Role()).list()
        .then(
          function(roles) {
            $scope.roles = [];
            _.each(roles, function(role) {
              var aRole = new Role(role);
              $scope.roles.push(aRole);
            });
          }, function(error) {
            console.log(error);
          });
    }

    $scope.setRole = function(index) {
      $scope.role = $scope.roles[index];
    }
    $scope.addCurrentUser = function() {
      console.log('addingCurrentUser');
      var relation = $scope.role._role.getUsers();
      relation.add(Parse.User.current());
      $scope.role._role.save()
        .then(
          function(role) {
            console.log(role);
            $scope.init();
            }
          ,function(error) {
            console.log(error);
          });
      
    }
    var findSocialUsers = function() {
      var query = new Parse.Query(Parse.User);
      query.equalTo('isSocial',true);
      return query.find();
    }
    $scope.createUpdateRole = function() {
      if ($scope.roleForm.$valid) {
        var roleACL = new Parse.ACL();
        roleACL.setWriteAccess(Parse.User.current(), true);
        roleACL.setPublicReadAccess(true);
        var role = new Parse.Role($scope.role.name, roleACL);
        roleACL.setRoleWriteAccess(role,true);
        Parse.Promise.when([role.save(), findSocialUsers()])
          .then(
            function (savedRole, socialUsers) {
              savedRole.getUsers().add(socialUsers[0]);
              return savedRole.save();
            })
          .then(
            function(role) {
              return role.getUsers().query().find();
            })
          .then(
            function(foundUsers) {
              console.log(foundUsers);
            },
            function(error) {
              console.log('role save failed');
              console.log(error);
            });
      } else {
        $scope.roleForm.submitted = true;
      }
      
    }

  });
