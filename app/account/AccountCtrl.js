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
    };
    $scope.save = function() {
      if ($scope.signupForm.$valid) {
        //Trigger email verification if primaryEmail has changed
        if (!_.isEqual(Parse.User.current().get('primaryEmail'),
                       $scope.user.primaryEmail)) {
          Parse.User.current().set('verifiedEmail',false);
        }
        Parse.User.current().set('firstName',$scope.user.firstName);
        Parse.User.current().set('lastName',$scope.user.lastName);
        Parse.User.current().set('primaryEmail',$scope.user.primaryEmail);
        
        Parse.User.current().save(Parse.User.current().attributes)
          .then(function() {
            if ($scope.$$phase || $scope.$root.$$phase) {
              $scope.$eval($location.path('/activities'));
            } else {
              $scope.$apply($location.path('/activities'));
            }
          });
      } else {
        $scope.signupForm.submitted = true;
      }
    };
  });
