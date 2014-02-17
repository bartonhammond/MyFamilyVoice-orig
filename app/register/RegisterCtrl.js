'use strict';
angular.module('fv')
  .controller('RegisterCtrl', function ($rootScope, $scope, User, $location, $q, Referral, requestNotificationChannel) {
      
    $scope.init = function () {
      $scope.confirmPassword='';

    };
    $scope.passwordsMatch = function() {
      return  _.isEqual($scope.signupForm.confirmpasswd.$viewValue,
                        $scope.signupForm.passwd.$viewValue);
    };
    /**
     * Return promise from either signing up a new user
     * or updateing the user created during the referral process
     */
    var registerOrReferral = function() {
      var defer = $q.defer();
      if (!_.isUndefined($rootScope.loginLink)) {
        (new Referral()).updateReferredUser($scope.registerUser.email,
                                            $scope.registerUser.password,
                                            false, //isSocial
                                            $rootScope.loginLink)
          .then(
            function(referredUser) {
              return (new User()).logIn(referredUser.get('primaryEmail'),
                                        $scope.registerUser.password);
            })
          .then(
            function() {
              defer.resolve();
            },
            function(error) {
              defer.reject(error);
            });
      } else {
        (new User()).signUp($scope.registerUser.email,
                            $scope.registerUser.password,
                            '',//firstname
                            '',//lastName
                            $scope.registerUser.email, //primaryEmail
                            false, //isSocial
                            false) //verifiedEmail
        .then(
          function(user) {
            defer.resolve(user);
          },
          function(error) {
            defer.reject(error);
          });
      }
      return defer.promise;
    };
    /**
     * On form submit, register
     */
    $scope.register = function () {
      if ($scope.signupForm.$valid && $scope.passwordsMatch()) {
        requestNotificationChannel.requestStarted();
        registerOrReferral()
          .then(
            function(){
              $rootScope.$broadcast('userloggedin');
              if ($scope.$$phase || $scope.$root.$$phase) {
                $scope.$eval($location.path('/account'));
              } else {
                $scope.$apply($location.path('/account'));
              }
            },
            function(response) {
              $scope.error = response.data.error;
            })
            .finally(
              function() {
                requestNotificationChannel.requestEnded();
              });
      } else {
        $scope.signupForm.submitted = true;
      }
    };
  });
