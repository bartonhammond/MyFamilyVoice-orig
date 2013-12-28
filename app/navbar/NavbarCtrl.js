'use strict';

angular.module('fv')
  .controller('NavbarCtrl', function ($scope, $location) {

    //show or hide the "Logout" button depending on the status of the user
    $scope.$watch(Parse.User.current().authenticated, function(authenticated) {
      $scope.authenticated = authenticated;
    });
    $scope.logout = function() {
      Parse.User.logout();
      return $location.path('/');

    };

  });
