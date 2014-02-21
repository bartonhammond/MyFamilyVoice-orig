/**
 * An AngularJS directive for showcasing features of your website
 * @version v0.0.2 - 2013-12-26
 * @link https://github.com/DaftMonk/angular-tour
 * @author Tyler Henkel
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

(function (window, document, undefined) {
  'use strict';
  angular.module('angular-tour', [
    'angular-tour.tpls',
    'angular-tour.tour'
  ]);
  angular.module('angular-tour.tpls', ['tour/tour.tpl.html']);
  angular.module('tour/tour.tpl.html', []).run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put('tour/tour.tpl.html', '<div class="tour-tip">\n' + '    <span class="tour-arrow tt-{{ placement }}"></span>\n' + '    <div class="tour-content-wrapper">\n' + '        <p ng-bind="content"></p>\n' + '        <a ng-click="nextAction()" ng-bind="nextLabel" class="small button tour-next-tip"></a>\n' + '        <a ng-click="closeAction()" class="tour-close-tip">\xd7</a>\n' + '    </div>\n' + '</div>');
    }
  ]);
  angular.module('angular-tour.tour', []).constant('tourConfig', {
    placement: 'top',
    animation: true,
    nextLabel: 'Next',
    scrollSpeed: 500,
    offset: 28,
    postTourCallback: function (stepIndex) {
    },
    postStepCallback: function (stepIndex) {
    }
  }).controller('TourController', [
    '$rootScope',
    '$scope',
    '$attrs',
    'orderedList',
    'tourConfig',
    function ($rootScope, $scope, $attrs, orderedList, tourConfig) {
      var self = this;
      self.currentIndex = -1
      self.currentStep =  null;
      self.steps = orderedList.getInstance();
      
      $scope.$on('show', function(event, msg) {
        $rootScope.showTour = true;
        $scope.openTour();
      });

      var selectIfFirstStep = function (step) {
        if (self.steps.first() === step) {
          self.select(step);
        } else {
          step.tt_open = false;
        }
      };
      self.selectAtIndex = function (index) {
        if (self.steps.get(index))
          self.select(self.steps.get(index));
      };
      self.getCurrentStep = function () {
        return self.currentStep;
      };
      self.select = function (nextStep) {
        var nextIndex = self.steps.indexOf(nextStep);
        function goNext() {
          if (self.currentStep) {
            self.currentStep.tt_open = false;
          }
          self.currentStep = nextStep;
          self.currentIndex = nextIndex;
          nextStep.tt_open = true;
        }
        if (nextStep) {
          goNext();
        } else {
          self.tourCompleted();
        }
      };
      self.addStep = function (step) {
        if (angular.isNumber(step.index) && !isNaN(step.index)) {
          self.steps.set(step.index, step);
        } else {
          self.steps.push(step);
        }
      };
      self.endTour = function () {
        self.steps.forEach(function (step) {
          step.tt_open = false;
        });
        //tourConfig.postTourCallback(self.currentIndex);
        $scope.$emit('onTourEnd');
      };
      self.startTour = function () {
        if ($rootScope.showTour) {
          self.steps.forEach(function (step) {
            selectIfFirstStep(step);
          });
        }
      };
      $scope.openTour = function () {
        self.startTour();
      };
      $scope.closeTour = function () {
        self.endTour();
      };
      self.tourCompleted = function () {
        self.endTour();
      };
      self.next = function () {
        var newIndex = self.currentIndex + 1;
        if (newIndex + 1 > self.steps.getCount()) {
          self.tourCompleted();
        }
        tourConfig.postStepCallback(newIndex);
        self.select(self.steps.get(newIndex));
      };
    }
  ]).directive('tour', function () {
    return {
      controller: 'TourController',
      scope: {
        onTourStart: '&',
        onTourEnd: '&'
      },
      restrict: 'EA',
      link: function (scope, element, attrs) {
        
      }
    };
  }).directive('tourtip', [
    '$window',
    '$compile',
    '$interpolate',
    '$timeout',
    'scrollTo',
    'tourConfig',
    function ($window, $compile, $interpolate, $timeout, scrollTo, tourConfig) {
      var startSym = $interpolate.startSymbol(), endSym = $interpolate.endSymbol();
      var template = '<div tour-popup ' + 'next-label="' + startSym + 'tt_next_label' + endSym + '" ' + 'content="' + startSym + 'tt_content' + endSym + '" ' + 'placement="' + startSym + 'tt_placement' + endSym + '" ' + 'next-action="tt_next_action()" ' + 'close-action="tt_close_action()" ' + 'is-open="' + startSym + 'tt_open' + endSym + '" ' + '>' + '</div>';
      return {
        require: '^tour',
        restrict: 'EA',
        scope: {}, //isoloate scope
        link: function (scope, element, attrs, tourCtrl) {
          scope.tt_content = attrs.tourtip;
          scope.tt_placement = attrs.tourtipPlacement || tourConfig.placement;
          scope.tt_next_label = attrs.tourtipNextLabel || tourConfig.nextLabel;
          scope.tt_offset = attrs.tourtipOffset ? parseInt(attrs.tourtipOffset, 10) :  tourConfig.offset;
          scope.tt_open = false;


          scope.tt_animation = tourConfig.animation;
          scope.tt_next_action = tourCtrl.next;
          scope.tt_close_action = tourCtrl.endTour;

          scope.index = parseInt(attrs.tourtipStep, 10);

          var tourtip = $compile(template)(scope);
          tourCtrl.addStep(scope);
          $timeout(function () {
            tourCtrl.startTour();
          }, 500);
          scope.$watch('tt_open', function (tt_open) {
            if (tt_open) {
              tourCtrl.select(scope);
              show();
            } else {
              hide();
            }
          });
          function show() {
            var position, ttWidth, ttHeight, ttPosition, height, width, targetElement;
            if (!scope.tt_content) {
              return;
            }
            if (scope.tt_animation)
              tourtip.fadeIn();
            else {
              tourtip.css({ display: 'block' });
            }
            element.after(tourtip);
            if (element.children().eq(0).length > 0) {
              targetElement = element.children().eq(0);
            } else {
              targetElement = element;
            }
            var updatePosition = function () {
              position = targetElement.position();
              ttWidth = tourtip.width();
              ttHeight = tourtip.height();
              width = targetElement.width();
              height = targetElement.height();
              switch (scope.tt_placement) {
              case 'right':
                ttPosition = {
                  top: position.top,
                  left: position.left + width + scope.tt_offset
                };
                break;
              case 'bottom':
                ttPosition = {
                  top: position.top + height + scope.tt_offset,
                  left: position.left
                };
                break;
              case 'left':
                ttPosition = {
                  top: position.top,
                  left: position.left - ttWidth - scope.tt_offset
                };
                break;
              default:
                ttPosition = {
                  top: position.top - ttHeight - scope.tt_offset,
                  left: position.left
                };
                break;
              }
              ttPosition.top += 'px';
              ttPosition.left += 'px';
              tourtip.css(ttPosition);
              scrollTo(tourtip, -200, -300, tourConfig.scrollSpeed);
            };
            angular.element($window).bind('resize.' + scope.$id, function () {
              updatePosition();
            });
            updatePosition();
          }
          function hide() {
            tourtip.detach();
            angular.element($window).unbind('resize.' + scope.$id);
          }
          scope.$on('$destroy', function onDestroyTourtip() {
            angular.element($window).unbind('resize.' + scope.$id);
            tourtip.remove();
            tourtip = null;
          });
        }
      };
    }
  ]).directive('tourPopup', function () {
    return {
      replace: true,
      templateUrl: 'tour/tour.tpl.html',
      scope: {
        content: '@',
        nextLabel: '@',
        placement: '@',
        nextAction: '&',
        closeAction: '&',
        isOpen: '@'
      },
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  }).factory('orderedList', function () {
    var orderedList = function() {
      this.map = {};
      this._array = [];
    };
    
    orderedList.prototype.set = function (key, value) {
      if (!angular.isNumber(key))
        return;
      if (key in this.map) {
        this.map[key] = value;
      } else {
        if (key < this._array.length) {
          var insertIndex = key - 1 > 0 ? key - 1 : 0;
            this._array.splice(insertIndex, 0, key);
        } else {
          this._array.push(key);
        }
        this.map[key] = value;
        this._array.sort(function(a,b){
          return a-b;
        });
      }
    };
    orderedList.prototype.indexOf = function (value) {
      for (var prop in this.map) {
        if (this.map.hasOwnProperty(prop)) {
          if (this.map[prop] === value)
              return Number(prop);
        }
      }
    };
    orderedList.prototype.push = function (value) {
      var key = this._array[this._array.length - 1] + 1 || 0;
      this._array.push(key);
      this.map[key] = value;
      this._array.sort(function(a, b) {
        return a-b;
      });
    };
    orderedList.prototype.remove = function (key) {
      var index = this._array.indexOf(key);
      if (index === -1) {
        throw new Error('key does not exist');
      }
      this._array.splice(index, 1);
      delete this.map[key];
    };
    orderedList.prototype.get = function (key) {
      return this.map[key];
    };
    orderedList.prototype.getCount = function () {
      return this._array.length;
    };
    orderedList.prototype.forEach = function (f) {
      var key, value;
      for (var i = 0; i < this._array.length; i++) {
        key = this._array[i];
        value = this.map[key];
        f(value, key);
      }
    };
    orderedList.prototype.first = function () {
      var key, value;
      key = this._array[0];
      value = this.map[key];
      return value;
    }

    var service = {
      getInstance: function() {
        return new orderedList();
      }
    }
    return service;
  }).factory('scrollTo', function () {
    return function (target, offsetY, offsetX, speed) {
      if (target) {
        offsetY = offsetY || -100;
        offsetX = offsetX || -100;
        speed = speed || 500;
        $('html,body').stop().animate({
          scrollTop: target.offset().top + offsetY,
          scrollLeft: target.offset().left + offsetX
        }, speed);
      } else {
        $('html,body').stop().animate({ scrollTop: 0 }, speed);
      }
    };
  });
}(window, document));
