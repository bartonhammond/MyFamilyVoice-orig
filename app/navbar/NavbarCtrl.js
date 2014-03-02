'use strict';
angular.module('fv')
  .controller('NavbarCtrl', function ($scope, $location, $window, CONFIG) {
    //Is there a current user?
    $scope.init = function() {
      $scope.$on('onTourEnd', function() {
        $location.path('/search');
      });
      
      $scope.authenticated = !_.isNull(Parse.User.current() &&
                                       Parse.User.current().authenticated());
    };
    $scope.showTour = function() {
      $location.path('/');
      $scope.$broadcast('tourshow');
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

    $scope.isSearch = function() {
      return $location.path().indexOf('search') > -1;
    };

    $scope.home = function() {
      $location.path('/');
    };

    $scope.search = function() {
      $location.path('/search');
    };

    $scope.login = function() {
      $location.path('/login');
    };

    $scope.account = function() {
      $location.path('/account');
    };

    //Logout user
    $scope.logout = function() {
      Parse.User.logOut();
      $scope.$broadcast('userloggedout');
      $scope.authenticated = false;
      $location.path(CONFIG.defaults.site);
    };

  });
