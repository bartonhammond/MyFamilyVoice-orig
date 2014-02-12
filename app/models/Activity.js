'use strict';
angular.module('fv').
  factory('Activity', function($q) {
    
    var Activity = function(activity) {
      if (!_.isUndefined(activity)) {
        this.activity = activity;
        this.id = activity.id;
        this.comment = activity.get('comment');
        this.createdAt = activity.createdAt;
        this.recordedDate = activity.get('recordedDate');
        this.file = activity.get('file');
        this.views = activity.get('views');
        this.photo = activity.get('photo');
        this.thumbnail = activity.get('thumbnail');
      }

      this.get = function (id) {
        var defer = $q.defer();
        var _Activity = Parse.Object.extend('Activity');
        var query = new Parse.Query(_Activity);
        query.get(id,{
          success : function(activity) {
            defer.resolve(activity);
          },
          error : function(aError) {
            defer.reject(aError);
          }
        });
        return defer.promise;
      };

      this.saveActivity = function (file) {
        var defer = $q.defer();
        this.activity.set('comment',this.comment);
        this.activity.set('recordedDate',new Date());
        if (file) {
          this.activity.set('photo', file);
        }
        this.activity.save()
        .then(
          function(activity) {
            defer.resolve(activity);
          },
          function(aError) {
            defer.reject(aError);
          });
        return defer.promise;
      };
      /**
       * If image selected, first save file
       * then associate it with the activity
       */
      this.save = function(file) {
        var self = this;
        if (file) {
          var defer = $q.defer();
          var parseFile = new Parse.File(file.name, file);
          parseFile.save()
            .then(
              function(savedFile) {
                return self.saveActivity(savedFile);
              })
            .then(
              function(savedActivity) {
                defer.resolve(savedActivity);
              }, function(error) {
                defer.reject(error);
              });
          return defer.promise;
        } else {
          return self.saveActivity();
        }
      };//save

      this.listened = function(id, userId) {
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
      };

      this.isNew = function() {
        return this.createdAt;
      };

      this.hasWriteAccess = function() {
        return Parse.User.current() && this.activity.getACL().getWriteAccess(Parse.User.current().id);
      };
      /**
       * Constrain list to only activities owned by id
       */
      this.list = function(user) {
        var defer = $q.defer();
        var Activity = Parse.Object.extend('Activity');
        var query = new Parse.Query(Activity);
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
      };
    };
    
    return Activity;
  });
