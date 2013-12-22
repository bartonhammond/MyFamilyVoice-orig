'use strict';

/*
Auth uses the parse-resource service to register and login users. Those methods return a promise for the calling method
to deal with.
 */

angular.module('fv')
  .factory('Auth', function (User, $window, $q) {

    var user = {};
    var authenticated = false;
    var store = $window.localStorage;
    var resource = User;

    function storeUser() {
      store.ngUser = angular.toJson(user);
    }

    function login(response) {
      user = response;
      authenticated = true;
      resource.user(response.sessionToken);
      storeUser();
    }

    function logout() {
      resource.logout();
      authenticated = false;
      user = {};
      delete store.ngUser;
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
      update: function(data) {
        var deferred  = $q.defer();
        
        resource.update(data.objectId,
                        _.pick(data,'firstName', 'lastName', 'primaryEmail')).then(
          function(response) {
            user.firstName = response.firstName;
            user.lastName = response.lastName;
            user.primaryEmail = response.primaryEmail;
            storeUser();
            deferred.resolve();
          }, function(error) {
            deferred.reject(error);
          });
        return deferred.promise;
      },
      //see if we can find a stored user and log them in
      //TODO: validate the sessionToken
      restore: function() {
        var fromStore = angular.fromJson(store.ngUser);
        if(fromStore !== undefined) {
          var user = angular.fromJson(store.ngUser);
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
