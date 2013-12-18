'use strict';

angular.module('fv')
  .controller('AccountCtrl', function ($scope) {
    /**
     * Init loginRadius
     */
    $scope.init = function() {
      $scope.user=$scope.$parent.user;
      console.log($scope);
    };
  });
