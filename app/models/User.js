'use strict';

angular.module('fv').
  factory('User', function($q) {
    
    var User = function(user) {
      if (!_.isUndefined(user)) {
        this.id = user.id;
        this.primaryEmail = user.get('primaryEmail');
        this.firstName = user.get('firstName');
        this.lastName = user.get('lastName');
        this.isSocial = user.get('isSocial');
        this.thumbNail = user.get('thumbnail');
        this.recaptcha = user.get('recaptcha');
      }
      
      this.signUp = function(userId, password, firstName, lastName, primaryEmail, isSocial, verifiedEmail) {
        return Parse.User.signUp(
          userId,
          password,
          {
            firstName: firstName,
            lastName: lastName,
            primaryEmail: primaryEmail,
            isSocial: isSocial,
            verifiedEmail: verifiedEmail
          });
      };

      this.logIn = function(userid, password) {
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
      };
      /**
       * This User has the attributes to save
       * Optional param: file
       */
      this.saveUser = function(file) {
        Parse.User.current().set('firstName', this.firstName);
        Parse.User.current().set('lastName', this.lastName);
        Parse.User.current().set('primaryEmail',this.primaryEmail);
        Parse.User.current().set('recaptcha',this.recaptcha);
        if (file) {
          Parse.User.current().set('photo', file);
        }
        var defer = $q.defer();
        //Have to pass in attributes or the
        //ones not set, are unset
        Parse.User.current().save(Parse.User.current().attributes)
          .then(
            function(user) {
              defer.resolve(user);
            }, function(error) {
              defer.reject(error);
            });
        
        return defer.promise;
      };
      /**
       * Get user by id
       */
      this.get = function(id) {
        var defer = $q.defer();
        var userQuery = new Parse.Query(Parse.User);
        userQuery
          .get(id, {
            success: function(user) {
              defer.resolve(user);
            },
            failure: function(error) {
              defer.reject(error);
            }
          });

        return defer.promise;
      };
      /**
       * If image selected, first save file
       * then associate it with the user
       */
      this.save = function(file) {
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
      };//save
      
      /**
       * List users with verifiedEmail and recaptcha
       * for val
       */
      this.findMembers = function(val) {
        var defer = $q.defer();
        
        Parse.Cloud.run('findMembers', {q: val})
          .then(
            function(members) {
              defer.resolve(members);
            },
            function(error) {
              defer.reject(error);
            });
        return defer.promise;
      };
    };//user
    
    return User;
  });
