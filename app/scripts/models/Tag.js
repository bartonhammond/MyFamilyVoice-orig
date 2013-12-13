'use strict';

angular.module('fv')
  .factory('Tag', function ($parseResource) {

    var Tag = new $parseResource('Tag');

    return Tag;

  });
