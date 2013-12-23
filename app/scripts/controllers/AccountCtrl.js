'use strict';

angular.module('fv')
  .controller('AccountCtrl', function ($scope, Auth, $location, RegisterUser) {
    /**
     * Init loginRadius
     */
    $scope.init = function() {
      //Clone so changes are only made when successfull put
      $scope.user = _.clone(Auth.me());
      console.log($scope);
    };
    $scope.save = function() {
      if ($scope.signupForm.$valid) {
        Auth.update($scope.user).then(function() {
          if (!Auth.me().verifiedEmail) {
            RegisterUser.create({}).$call('sendConfirmEmail', Auth.me()).then(
              function(response) {
                console.log('AccountCtrl sendConfirmEmail response');
                console.log(response);
                $location.path('/activities');
              },
              function(error) {
                console.log('AccountCtrl sendConfirmEmail error');
                console.log(error);
              }
            );
          } else {
            $location.path('/activities');
          }
        }, function(error) {
          $scope.error = error.data.error;
        });
      } else {
        $scope.signupForm.submitted = true;
      }
    };
  });
