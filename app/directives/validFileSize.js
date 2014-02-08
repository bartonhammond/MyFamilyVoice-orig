'use strict';
angular.module('fv')
  .directive('validfilesize', function() {
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
        });
      }
    };
  });
