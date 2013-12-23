'use strict';

angular.module('fv')
  .controller('ConfirmEmailCtrl', function ($scope, $routeParams, $q, RegisterUser) {
    $scope.confirm = function() {
      var deferred = $q.defer();
      var link = $routeParams.link;
      RegisterUser.create({}).$call('confirmEmail', {link: link}).then(
        function(response) {
          console.log('confirmEmail response');
          console.log(response);
          deferred.resolve(true);
        },
        function(error) {
          console.log('AccountCtrl sendConfirmEmail error');
          console.log(error);
          deferred.reject();
        }
      );
      return deferred.promise;
    };
    /**
     * Init 
     */
    $scope.init = function() {
      $scope.confirmed = false;
      var promise = $scope.confirm();
      promise.then(function() {
        $scope.confirmed = true;
      }, function() {
        var nextPromise = $scope.confirm();
        nextPromise.then(function() {
          $scope.confirmed = true;
        }, function () {
          console.log('failed second time');
        });
      });
    };
  });
