'use strict';
angular.module('fv').
  factory('User', function() {
    var User = Parse.User.extend({
      initialize: function(attr, options) {
        this.primaryEmail = '';
        this.firstName = '';
        this.lastName = '';
        this.isSocial = '';
      }
    }, {
      // Class methods
      setProperties: function(user) {
        this.primaryEmail = user.get('primaryEmail');
        this.firstName = user.get('firstName');
        this.lastName = user.get('lastName');
        this.isSocial = user.get('isSocial');
      }
    });
    
    return User;
  });
