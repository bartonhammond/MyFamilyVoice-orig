'use strict';
angular.module('fv').
  factory('User', function($q) {
    
    var User = {
      primaryEmail : '',
      firstName : '',
      lastName : '',
      isSocial : '',

      setProperties: function(user) {
        this.primaryEmail = user.get('primaryEmail');
        this.firstName = user.get('firstName');
        this.lastName = user.get('lastName');
        this.isSocial = user.get('isSocial');
      },
      logIn: function(userid, password) {
        var defer = $q.defer();
        
        Parse.User.logIn(userid, password)
        .then(
          function(data) {
            defer.resolve(data);
          },
          function(error) {
            defer.reject(error);
          });
        return defer.promise;
      },
      save: function() {
        //Trigger email verification if primaryEmail has changed
        if (!_.isEqual(Parse.User.current().get('primaryEmail'),
                       this.primaryEmail)) {
          Parse.User.current().set('verifiedEmail',false);
        }
        Parse.User.current().set('firstName', this.firstName);
        Parse.User.current().set('lastName', this.lastName);
        Parse.User.current().set('primaryEmail',this.primaryEmail);
        
        var defer = $q.defer();
        //Have to pass in attributes or the
        //ones not set, are unset
        Parse.User.current().save(Parse.User.current().attributes)
          .then(
            function() {
              defer.resolve();
            }, function(error) {
              defer.reject(error);
            });
        
        return defer.promise;
      }
    }    
    return User;
  });
