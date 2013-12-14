'use strict';

angular.module('fv')
  .controller('RegisterCtrl', function ($scope, Auth, $location) {
   
    $scope.init = function () {
      $scope.confirmPassword='';
    };
    $scope.passwordsMatch = function() {
      return  _.isEqual($scope.signupForm.confirmpasswd.$viewValue,
                        $scope.signupForm.passwd.$viewValue);
    };
    $scope.register = function () {
      if ($scope.signupForm.$valid && $scope.passwordsMatch()) {
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
