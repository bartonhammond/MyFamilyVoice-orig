'use strict';

angular.module('fv')
  .factory('User', function ($parseResource) {

    var User = new $parseResource('User');

    return User;

  });

