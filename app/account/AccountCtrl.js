'use strict';

angular.module('fv')
  .controller('AccountCtrl', function ($scope, $location, User) {
    /**
     * Init loginRadius
     */
    $scope.init = function() {
      //Clone so changes are only made when successfull put
      User.setProperties(Parse.User.current());
      $scope.user = User;
      $scope.photo = "";
    };
    $scope.setFiles = function(element) {
      $scope.photo = element.files[0];
      //The directive resets the model so keep this safe
      $scope.photoFile = element.files[0];
    }
 
    $scope.save = function() {
      if ($scope.signupForm.$valid) {
        $scope.user.save($scope.photoFile)
          .then(
            function() {
              $location.path('/activities');
            },
            function(error) {
              $scope.signupForm.submitted = true;
              console.log(error);
            });
      } else {
        $scope.signupForm.submitted = true;
      }
    };
  }).directive('validfilesize', function() {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function(viewValue) {
          if (scope.photo.size < (2 * 1048576)) {
            // it is valid
            ctrl.$setValidity('validfilesize', true);
            return viewValue;
          } else {
            // it is invalid, return undefined (no model update)
            ctrl.$setValidity('validfilesize', false);
            return undefined;
          }
        })
      }
    }
  }).directive('validfiletype', function() {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$parsers.unshift(function(viewValue) {
          if (scope.photo.type.indexOf('image') === 0) {
            // it is valid
            ctrl.$setValidity('validfiletype', true);
            return viewValue;
          } else {
            // it is invalid, return undefined (no model update)
            ctrl.$setValidity('validfiletype', false);
            return undefined;
          }
        })
      }
    }
  });
