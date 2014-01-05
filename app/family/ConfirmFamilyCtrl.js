'use strict';

angular.module('fv')
  .controller('ConfirmFamilyCtrl', function ($scope, $routeParams, $q, User) {
    $scope.confirm = function() {
      var deferred = $q.defer();
      var link = $routeParams.link;
      Parse.Cloud.run('confirmFamily', {link: link}).then(
        function(response) {
          console.log('confirmEmail response');
          console.log(response);
          deferred.resolve(true);
        },
        function(error) {
          console.log('confirmFamily error');
          console.log(error);
          deferred.reject();
        }
      );
      return deferred.promise;
    };
    /**
     * Init - doing 2 cause an error isn't quite correct
     */
    $scope.init = function() {
      var link = $routeParams.link;
      var Family = Parse.Object.extend('Family');
      var query = new Parse.Query(Family);   
      query.equalTo("link", link);
      query.find()
        .then(
          function(results) {
            var link = results[0];
            return User.get(link.get('kin').id);
          })
        .then(
          function(kin) {
            $scope.firstName = kin.get('firstName');
            $scope.lastName = kin.get('lastName');
            return $scope.confirm();
          })
        .then(
          function(status) {
            $scope.confirmed = true;
          },
          function(error) {
            var nextPromise = $scope.confirm();
            nextPromise.then(function() {
              $scope.confirmed = true;
            }, function () {
              console.log('failed second time');
            });
          });
    };
  });
