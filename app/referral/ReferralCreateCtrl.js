'use strict';
angular.module('fv')
  .controller('ReferralCreateCtrl', function ($rootScope, $scope, User, Referral, $location, requestNotificationChannel, $timeout) {

    $scope.init = function () {
      $scope.referral = new Referral();
      $scope.referralSuccess = false;
    };

    $scope.createReferral = function () {
      if ($scope.signupForm.$valid) {
        requestNotificationChannel.requestStarted();
        $scope.referral.createReferral()
          .then(
            function(){
              $scope.referralSuccess = true;
              $timeout(function() {
                $location.path('/referral');
              },2000);
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
