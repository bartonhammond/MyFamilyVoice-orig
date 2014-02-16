'use strict';

angular.module('fv')
  .controller('ReferralIndexCtrl', function ($scope, $routeParams, $location, Referral) {
    $scope.newReferral = function() {
      $location.path('/referral/add');
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

