'use strict';
angular.module('fv').
  factory('Activity', function($q, User) {
    
    var Activity = Parse.Object.extend('Activity', {
      // Instance methods
      //Add prototypes for roles & users
      //
      initialize: function (attr, options) {
        console.log('Activity initialize');
        console.log(attr);
        console.log(options);
        console.log('extend Activity');
        var fields = ['file', 'views','comment', 'date'];
        _.each(fields, function(field) {
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
      get: function (id) {
        var defer = $q.defer();
        
        var query = new Parse.Query(this);

        query.get(id,{
          success : function(activity) {
            defer.resolve(activity);
          },
          error : function(aError) {
            defer.reject(aError);
          }
        });
 
        return defer.promise;

      },
      save: function (activity) {
        var defer = $q.defer();
        if (_.isUndefined(activity.createdAt)) {
          var roleACL = new Parse.ACL();
          roleACL.setWriteAccess(Parse.User.current().id, true);
          roleACL.setPublicReadAccess(true);
          activity.setACL(roleACL);
        }
        
        activity.save()
        .then(
          function(activity) {
            defer.resolve(activity);
          },
          function(aError) {
            defer.reject(aError);
          });
 
        return defer.promise;

      },
      listened: function(id, userId) {
        var defer = $q.defer();
        Parse.Cloud.run('activityListened',
                        {activityId: id,
                         activityUserId: userId,
                         userId: Parse.User.current().id})
        .then(
          function() {
            defer.resolve();
          },
          function(error) {
            defer.reject(error);
          });
        return defer.promise;
      },
      /**
       * Constrain list to only activities owned by id
       */
      list : function(user) {
        var defer = $q.defer();
        var self = this;
        var query = new Parse.Query(self);
        query.equalTo('user',user);
        query.find()
          .then(
            function(activities) {
              defer.resolve(activities);
            },
            function(aError) {
              defer.reject(aError);
            });
        
        return defer.promise;
      }
      
    });
    
    return Activity;
  });
