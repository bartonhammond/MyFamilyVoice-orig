'use strict';

angular.module('fv')
  .factory('UserCollection', function ($collection, User) {

    //angular-collection https://github.com/tomkuk/angular-collection

    //create the new collection
    var UserCollection = $collection;
    var users = UserCollection.getInstance();

    //add a method for querying
    users.query = function (query) {
      console.log('query users');
      User.query(query).then(function (response) {
        users.addAll(response);
      });
    };

    return users;

  });
