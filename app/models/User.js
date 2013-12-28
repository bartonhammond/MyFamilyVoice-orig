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
      /**
       * This User has the attributes to save
       * Optional param: file
       */
      saveUser: function(file) {
        //Trigger email verification if primaryEmail has changed
        if (!_.isEqual(Parse.User.current().get('primaryEmail'),
                       this.primaryEmail)) {
          Parse.User.current().set('verifiedEmail',false);
        }
        Parse.User.current().set('firstName', this.firstName);
        Parse.User.current().set('lastName', this.lastName);
        Parse.User.current().set('primaryEmail',this.primaryEmail);
        if (file) {
          Parse.User.current().set('photo', file);
        }
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
      },
      /**
       * If image selected, first save file
       * then associate it with the user
       */
      save: function(file) {
        var self = this;
        if (file) {
          var defer = $q.defer();
          var parseFile = new Parse.File(file.name, file);
          parseFile.save()
            .then(
              function(savedFile) {
                return self.saveUser(savedFile);
              })
            .then(
              function(savedUser) {
                defer.resolve(savedUser);
              }, function(error) {
                defer.reject(error);
              });
          return defer.promise;
        } else {
          return self.saveUser();
        }
      }//save
    };//user
      
    return User;
  });
