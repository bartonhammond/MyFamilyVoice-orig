'use strict';
angular.module('fv').
  factory('Role', function($q) {
    
    var Role = function(role) {
      if (!_.isUndefined(role)) {
        this.name = role.get('name');
        this.roles = role.get('roles');
        this.users = role.get('users');
      }
      
      this.list = function() {
        var defer = $q.defer();
        
        var query = new Parse.Query(Parse.Role);
        query.find({
          success : function(aRole) {
            defer.resolve(aRole);
          },
          error : function(aError) {
            defer.reject(aError);
          }
        });
        
        return defer.promise;
      };
    };
      
    return Role;
  });
