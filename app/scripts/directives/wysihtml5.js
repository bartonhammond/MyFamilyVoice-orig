'use strict';

angular.module('parseApp')
  .directive('wysihtml5', function () {
    return {
      require: '?ngModel',
      restrict: 'A',
      link: function(scope, element, attrs, ngModel) {

        //bind the editor to this element
        element.wysihtml5({stylesheets: []});

        //need a model to bind the content editor to
        if (!ngModel) {
          return;
        }

        //update the angular scope when the editor changes (loses focus)
        element.data('wysihtml5').editor.on('change', function () {
          _.defer(function() {
            scope.$apply(ngModel.$setViewValue(element.data('wysihtml5').editor.getValue()));
          });

        });
      }
    };
  });
