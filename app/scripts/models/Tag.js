'use strict';

angular.module('parseApp')
  .factory('Tag', function ($parseResource) {

    var Tag = new $parseResource('Tag');

    return Tag;

  });
