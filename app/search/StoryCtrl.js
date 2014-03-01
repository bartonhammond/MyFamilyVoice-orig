'use strict';

angular.module('fv')
  .controller('StoryCtrl', function ($scope) {

    $scope.init = function(aUser) {
      console.log('storyCtrl: init');
      console.log(aUser);
      $scope.user = aUser;
    };
  });
