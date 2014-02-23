'use strict';

angular.module('fv')
  .filter('secondsFilter',function() {
    return function(seconds) {
      if (seconds >= 10) {
        return  seconds;
      }
      return '0' + seconds;
    };
  });


