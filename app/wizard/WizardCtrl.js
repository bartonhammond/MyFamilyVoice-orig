'use strict';
angular.module('fv')
  .controller('WizardCtrl', function ($scope, $q, $timeout, User, limitToFilter) {
    $scope.user = new User(Parse.User.current());
    $scope.storyType = 'self';
    $scope.results = {};
    $scope.saveState = function() {
      console.log($scope.storyType);
      
      var deferred = $q.defer();
      
      $timeout(function() {
        deferred.resolve();
      }, 1000);
      
      return deferred.promise;
    };

    $scope.onSelect = function(item, model) {
      console.log('typeAheadOnSelect: ' + item + ' ' + model);
    };

    $scope.findMembers = function(val) {
      if (val && val.length < 5) {
        return [];
      } else {
        return (new User()).findMembers(val)
          .then(
            function(results) {
              $scope.results = {};
              _.each(results, function(user) {
                $scope.results[user.name] = user;
              });
              
              return limitToFilter(results,15);
            },
            function(error) {
              console.log(error);
              return [];
            });
      }
    };
  });
