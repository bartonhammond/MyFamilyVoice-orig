'use strict';
angular.module('fv')
  .controller('NavbarCtrl', function ( $scope, $location) {
    //Is there a current user?
    $scope.init = function() {
      $scope.authenticated = !_.isNull(Parse.User.current() &&
                                            Parse.User.current().authenticated());
    };
    //LoginCtrl broadcasts 
    $scope.$on('userloggedin',function() {
      $scope.authenticated = true;
    });
    //On route change, checks requests
    $scope.$on('newfamilyrequests',function(event, cnt) {
      if (cnt > 0) {
        $scope.newFamilyRequests = cnt;
      } else {
        $scope.newFamilyRequests = undefined;
      }
    });

    //Logout user
    $scope.logout = function() {
      Parse.User.logOut();
      $scope.authenticated = false;
      return $location.path('/');
    };

  });
