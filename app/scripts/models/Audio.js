'use strict';

angular.module('parseApp')
  .factory('Audio', function ($parseResource) {

    var Audio = new $parseResource('Audio');

    return Audio;

  });
