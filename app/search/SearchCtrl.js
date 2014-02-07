'use strict';

angular.module('fv')
  .controller('SearchCtrl', function ($scope, $location, Search, Activity, Family) {
    $scope.init = function() {
      $scope.search = {};
      $scope.search.q = '';
      $scope.performSearch();
      $scope.familyRequestSent = false;
    };
    /**
     * Search 
     */
    $scope.performSearch = function() {
      Search.search($scope.search)
        .then(
          function(response) {
            $scope.search.items = response;
          },
          function(error) {
            console.log(error);
          });
    };
    /**
     * On search, only Users have Join Family
     */
    $scope.joinFamily = function(index) {
      (new Family()).join($scope.search.items[index].objectId)
        .then(
          function() {
            $scope.search.items[index].familyRequestSent = true;
          },
          function(error) {
            console.log(error);
          });
    };
    /**
     * On search, only Users have Join Family
     */
    $scope.subscribe = function(index) {
      var userId = $scope.search.items[index].objectId;
      var status = $scope.search.items[index].subscribed;
      (new Family()).subscribe(userId, !status)
        .then(
          function() {
            $scope.search.items[index].isSubscribed = !status;
          },
          function(error) {
            console.log(error);
          });
    };
    $scope.listened = function(index) {
      (new Activity()).listened($scope.search.items[index].objectId,
                        $scope.search.items[index].userId);
    };
    $scope.edit = function(activity) {
      $location.path('/activities/edit/' + activity.objectId);
    };

    $scope.record = function(activity) {
      $location.path('/activities/record/' + activity.objectId);
    };

    $scope.newQuestion = function() {
      $location.path('/activities/add');
    };
    
  });
