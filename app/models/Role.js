'use strict';
angular.module('fv').
  factory('Role', function($q) {
    
    var Role = Parse.Role.extend({
      // Instance methods
      //Add prototypes for roles & users
      //
      initialize: function (attr, options) {
        console.log('Role initialize');
        console.log(attr);
        console.log(options);
        console.log('extend Role');
        var fields = ['name'];
        _.each(fields, function(field) {
          console.log('field: ' + field);
          // Properties
          Role.prototype.__defineGetter__(field, function() {
            return this.get(field);
          });
          Role.prototype.__defineSetter__(field, function(aValue) {
            return this.set(field, aValue);
          });
        });
        Role.prototype.__defineGetter__("roles", function() {
          return JSON.stringify(this.get("roles"));
        });
        Role.prototype.__defineSetter__("roles", function(aValue) {
          return this.set("roles", JSON.parse(aValue));
        });          
        Role.prototype.__defineGetter__("users", function() {
          return JSON.stringify(this.get("users"));
        });
        Role.prototype.__defineSetter__("users", function(aValue) {
          return this.set("users", JSON.parse(aValue));
        });          

      }
    }, {
      // Class methods
      
      list : function() {
        var defer = $q.defer();
        
        var query = new Parse.Query(this);
        query.find({
          success : function(aRole) {
            defer.resolve(aRole);
          },
          error : function(aError) {
            defer.reject(aError);
          }
        });
 
        return defer.promise;
      }
      
      
    });
    
    return Role;
  });
