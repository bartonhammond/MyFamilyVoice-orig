'use strict';

angular.module('fv')
  .controller('FamilyIndexCtrl', function ($scope, $routeParams, $location, Family) {

    $scope.init = function() {
      (new Family()).list(Parse.User.current())
        .then(
          function(families) {
            var _families = [];
            _.each(families, function(family) {
              _families.push(new Family(family));
            });
            $scope.families = _families;
          },
          function(error) {
            console.log(error);
            window.history.back();
          });
    };
    $scope.toggleApproval = function(index) {
      $scope.families[index].toggleApproval();
      $scope.families[index].save()
      .then(
        function(family) {
          $scope.families[index] = new Family(family);
        },
        function(error) {
          console.log(error);
        });
    };
  });
