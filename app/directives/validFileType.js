'use strict';
angular.module('fv')
  .directive('validfiletype', function() {
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
        });
      }
    };
  });
