'use strict';

angular.module('fv')
  .directive('fvTooltip', function () {
    return {
      restrict:'A',
      link: function(scope, element, attrs) {

        var showToolTip = function(value) {
          if (_.isUndefined(value) || _.isEmpty(value)) {
            return;
          }
          //clean previous definition
          $(element).qtip('destroy', true);

          scope.qtipSkin = 'qtip-light';

          element.qtip({
            content: {
              text: value
            },
            style: {
              classes: scope.qtipSkin + ' qtip-rounded qtip-shadow'
            },
            show: {
              event: 'mouseover',
              solo: true
            },
            hide: {
              event: 'mouseleave',
              delay: 300,
              fixed: (($(this).hover || attrs.fixed) ? true : false),  //prevent the tooltip from hiding when set to true
              leave: false
            },
            position: {
              viewport: $(window),// Keep it on-screen at all times if possible
              target: (attrs.target ? attrs.target :'event'),
              my: 'top center',
              at:  'bottom center'
            }
          });

          scope.$on('$destroy', function () {
            $(element).qtip('destroy', true); // Immediately destroy all tooltips belonging to the selected elements
          });

        };
        attrs.$observe('fvTooltip', showToolTip);

        scope.$on('$destroy', function() {
          $(element).tooltip('destroy');
        });
      }
    };
  });
