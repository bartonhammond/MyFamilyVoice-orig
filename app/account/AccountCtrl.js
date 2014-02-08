'use strict';

angular.module('fv')
  .controller('AccountCtrl', function ($scope, $location, User, requestNotificationChannel) {
    /**
     * Init loginRadius
     */
    $scope.init = function() {
      //Clone so changes are only made when successfull put
      User.setProperties(Parse.User.current());
      $scope.user = User;
      $scope.photo = '';
    };

    $scope.setFiles = function(element) {
      $scope.photo = element.files[0];
      //The directive resets the model so keep this safe
      $scope.photoFile = element.files[0];
    };

    $scope.getThumbnail = function() {
      return !_.isUndefined(Parse.User.current().get('thumbnail')) ?
        Parse.User.current().get('thumbnail')._url
        :
        null;
    };

    $scope.save = function() {
      if ($scope.signupForm.$valid) {
        requestNotificationChannel.requestStarted();
        $('#submitBtn').attr('disabled','disabled');
        $scope.user.save($scope.photoFile)
          .then(
            function() {
              $location.path('/activities');
            },
            function(error) {
              $scope.signupForm.submitted = true;
              console.log(error);
            })
          .finally(
            function() {
              $('#submitBtn').attr('disabled',false);
              requestNotificationChannel.requestEnded();
            });

      } else {
        $scope.signupForm.submitted = true;
      }
    };
  });
