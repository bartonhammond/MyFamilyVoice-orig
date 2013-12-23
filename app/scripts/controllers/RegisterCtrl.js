'use strict';
angular.module('fv')
  .controller('RegisterCtrl', function ($rootScope, $scope, RegisterUser, Auth, $location) {
      
    $scope.init = function () {
      $scope.confirmPassword='';

    };
    $scope.passwordsMatch = function() {
      return  _.isEqual($scope.signupForm.confirmpasswd.$viewValue,
                        $scope.signupForm.passwd.$viewValue);
    };
    $scope.register = function () {
      if ($scope.signupForm.$valid && $scope.passwordsMatch()) {
        
        //Keep primaryEmail as the confirmation email requirement
        $scope.registerUser.primaryEmail = $scope.registerUser.username;

        //non-social users can not change their email
        $scope.registerUser.isSocial = false;

        //Email needs to be verified
        $scope.registerUser.verifiedEmail = false;
        Auth.register($scope.registerUser).then(function(){
          $location.path('/activities');
        }, function(response) {
          $scope.error = response.data.error;
        });
      } else {
        $scope.signupForm.submitted = true;
      }
    };
  });
