'use strict';

angular.module('fv')
  .factory('Activity', function ($parseResource) {

    var Activity = new $parseResource('Activity');

    return Activity;

  });
