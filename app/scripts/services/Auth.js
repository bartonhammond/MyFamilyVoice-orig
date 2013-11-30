'use strict';

/*
Auth uses the parse-resource service to register and login users. Those methods return a promise for the calling method
to deal with.
 */

angular.module('parseApp')
  .factory('Auth', function (User, $window) {

    var user = {};
    var authenticated = false;
    var store = $window.localStorage;
    var resource = User;

    function login(response) {
      user = response;
      authenticated = true;
      resource.user(user.sessionToken);
      store.ng_user = angular.toJson(user);
    }

    function logout() {
      resource.logout();
      authenticated = false;
      user = {};
      delete store.ng_user;
    }

    // Public API here
    return {
      login: function(data) {
        return resource.login(data).then(function(response) {
          login(response);
        }, function(response) {
          throw response;
        });

      },
      //append the response to the supplied data because parse does not return a full user object
      register: function(data) {
        return resource.register(data).then(function(response) {
          delete data.password;
          data.objectId = response.objectId;
          data.sessionToken = response.sessionToken;
          data.createdAt = response.createdAt;
          var user = resource.create(data);
          login(user);
        }, function(response) {
          throw response;
        });
      },
      //see if we can find a stored user and log them in
      //TODO: validate the sessionToken
      restore: function() {
        var fromStore = angular.fromJson(store.ng_user);
        if(fromStore !== undefined) {
          var user = angular.fromJson(store.ng_user);
          login(user);
        }
      },
      me: function() {
        return user;
      },
      isAuthenticated: function() {
        return authenticated;
      },
      //TODO: finish the method to validate a user with parse
      validate: function() {
        resource.validate(user.sessionToken).then(function(response) {
          console.log(response);
        });
      },
      logout: function() {
        logout();
      }

    };
  });
