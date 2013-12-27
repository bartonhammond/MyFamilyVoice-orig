'use strict';
angular.module('fv').
  factory('Activity', function($q) {
    
    var Activity = Parse.Activity.extend({
      // Instance methods
      //Add prototypes for roles & users
      //
      initialize: function (attr, options) {
        console.log('Activity initialize');
        console.log(attr);
        console.log(options);
        console.log('extend Activity');
        var fields = ['name'];
        _.each(fields, function(field) {
          console.log('field: ' + field);
          // Properties
          Activity.prototype.__defineGetter__(field, function() {
            return this.get(field);
          });
          Activity.prototype.__defineSetter__(field, function(aValue) {
            return this.set(field, aValue);
          });
        });
      }
    }, {
      // Class methods
      
      list : function() {
        var defer = $q.defer();
        
        var query = new Parse.Query(this);
        query.find({
          success : function(activites) {
            defer.resolve(activities);
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
