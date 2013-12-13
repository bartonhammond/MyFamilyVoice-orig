'use strict';

angular.module('fv')
  .controller('NavbarCtrl', function ($scope, Auth, $location, Logout) {

    //show or hide the "Logout" button depending on the status of the user
    $scope.$watch(Auth.isAuthenticated, function(authenticated) {
      $scope.authenticated = authenticated;
    });
    $scope.logout = function() {

      //remove the user from the application
      Auth.logout();

      //this cleans up the data collections
      Logout.logout();

      return $location.path('/');

    };

  });
