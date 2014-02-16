'use strict';

angular.module('fv')
  .controller('ReferralIndexCtrl', function ($scope, $routeParams, $location, $timeout, Referral) {
    $scope.newReferral = function() {
      $location.path('/referral/add');
    };

    $scope.sendReferralEmail = function(referral) {
      referral.sendReferralEmail()
      .then(
        function() {
          $scope.emailSent = true;
          $timeout(function() {
            $scope.emailSent = false;
          }, 4000);
        },
        function(error) {
          console.log(error);
        });
    };

    $scope.init = function() {

      (new Referral()).list(Parse.User.current())
        .then(
          function(referrals) {
            var _referrals = [];
            _.each(referrals, function(referral) {
              _referrals.push(new Referral(referral));
            });
            $scope.referrals = _referrals;
          },
          function(error) {
            console.log(error);
          });
    };
  });

