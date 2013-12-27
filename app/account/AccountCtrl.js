'use strict';

angular.module('fv')
  .controller('AccountCtrl', function ($scope, $location, User) {
    /**
     * Init loginRadius
     */
    $scope.init = function() {
      //Clone so changes are only made when successfull put
      User.setProperties(Parse.User.current());
      $scope.user = User;
    };
    $scope.save = function() {
      if ($scope.signupForm.$valid) {
        $scope.user.save()
          .then(
            function() {
              $location.path('/activities');
            },
            function(error) {
              $scope.signupForm.submitted = true;
              console.log(error);
            });
      } else {
        $scope.signupForm.submitted = true;
      }
    };
  });
