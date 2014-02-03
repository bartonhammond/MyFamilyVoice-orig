'use strict';
angular.module('fv')
  .controller('RegisterCtrl', function ($rootScope, $scope, User, $location) {
      
    $scope.init = function () {
      $scope.confirmPassword='';

    };
    $scope.passwordsMatch = function() {
      return  _.isEqual($scope.signupForm.confirmpasswd.$viewValue,
                        $scope.signupForm.passwd.$viewValue);
    };
    $scope.register = function () {
      if ($scope.signupForm.$valid && $scope.passwordsMatch()) {

        User.signUp($scope.registerUser.email,
                    $scope.registerUser.password,
                    '',//firstname
                    '',//lastName
                    $scope.registerUser.email, //primaryEmail
                    false, //isSocial
                    false) //verifiedEmail
          .then(function(){
            $rootScope.$broadcast('userloggedin');
            if ($scope.$$phase || $scope.$root.$$phase) {
              $scope.$eval($location.path('/account'));
            } else {
              $scope.$apply($location.path('/account'));
            }
          }, function(response) {
            $scope.error = response.data.error;
          });
      } else {
        $scope.signupForm.submitted = true;
      }
    };
  });
