'use strict';

angular.module('fv')
  .factory('Role', function ($parseResource) {

    var Role = new $parseResource('Role', 'role');

    return Role;

  });
