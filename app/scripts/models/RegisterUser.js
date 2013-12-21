'use strict';

angular.module('fv')
  .factory('RegisterUser', function ($parseResource) {

    var User = new $parseResource('RegisterUser');

    return User;

  });

