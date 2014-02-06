'use strict';
angular.module('fv').
  factory('Role', function($q, Relation) {
    
    var Role = function(role) {
      if (!_.isUndefined(role)) {
        this._role = role;
        this.name = role.get('name');
        this.roles = new Relation(role.get('roles'));
        this.users = new Relation(role.get('users'));
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
