'use strict';

angular.module('parseApp')
  .factory('Activity', function ($parseResource) {

    var Activity = new $parseResource('Activity');

    return Activity;

  });
