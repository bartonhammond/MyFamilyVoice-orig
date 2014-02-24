'use strict';

angular.module('fv')
  .directive('fvDebounce', function($timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      priority: 99,
      link: function(scope, elm, attr, ngModelCtrl) {
        if (attr.type === 'radio' || attr.type === 'checkbox') {
          return;
        }

        elm.unbind('input');

        var debounce;
        elm.bind('input', function() {
          $timeout.cancel(debounce);
          debounce = $timeout( function() {
            if (scope.$$phase || scope.$root.$$phase) {
              scope.$eval(function() {
                ngModelCtrl.$setViewValue(elm.val());
              });
            } else {
              scope.$apply(function() {
                ngModelCtrl.$setViewValue(elm.val());
              });
            }
          }, attr.fvDebounce);
        });//bind

        elm.bind('blur', function() {
          if (scope.$$phase || scope.$root.$$phase) {
            scope.$eval(function() {
              ngModelCtrl.$setViewValue(elm.val());
            });
          } else {
            scope.$apply(function() {
              ngModelCtrl.$setViewValue(elm.val());
            });
          }
        });//bind

        elm.bind('keydown', function(event) {
          if (event && event.keyCode === 13) { //Enter
            if (scope.$$phase || scope.$root.$$phase) {
              scope.$eval(function() {
                ngModelCtrl.$setViewValue(elm.val());
              });
            } else {
              scope.$apply(function() {
                ngModelCtrl.$setViewValue(elm.val());
              });
            }
          }
        });//bind
      }//link
    };//return
  });
