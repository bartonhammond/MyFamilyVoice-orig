'use strict';

angular.module('parseApp')
  .factory('User', function ($parseResource) {

    var User = new $parseResource('User');

    return User;

  });

