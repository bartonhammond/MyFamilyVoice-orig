'use strict';

angular.module('fv')
  .factory('RoleCollection', function ($collection, Role) {

    //create the new collection
    var RoleCollection = $collection;
    var roles = RoleCollection.getInstance();

    //add a method for querying
    roles.query = function (query) {
      console.log('query roles');
      Role.query(query).then(function (response) {
        roles.addAll(response);
      });
    };

    return roles;

  });
