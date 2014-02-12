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
        /**
     * Make url point to server to proxy stream content
     */
    $scope.proxyUrl = function() {
      //http://files.parse.com/3e0d5059-d213-40a3-a224-44351b90a9d1/cb8020bb-6210-440a-b69f-6c62bb9cb1a4-recording.mp3
      return Parse.User.current().get('photo')._url.replace('http://files.parse.com','/parse');
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
