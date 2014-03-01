'use strict';

angular.module('fv')
  .controller('StoryCtrl', function ($scope, fileReader) {
    

    $scope.init = function(aUser) {
      console.log('storyCtrl: init');
      console.log(aUser);
      $scope.user = aUser;
    };
    $scope.setFiles = function(element) {
      $scope.photo = element.files[0];
      $scope.photoFile = element.files[0];
    };
    
    $scope.getFile = function () {
      $scope.progress = 0;
      fileReader.readAsDataUrl($scope.file, $scope)
        .then(function(result) {
          $scope.imageSrc = result;
        });
    };

  });

