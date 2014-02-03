'use strict';
angular.module('fv').
  factory('Family', function($q) {
    
    var Family = function(family) {
      if (!_.isUndefined(family)) {
        this.approved = family.get('approved');
        this.firstName = family.get('kin').get('firstName');
        this.lastName = family.get('kin').get('lastName');
        this.requestedDate = family.createdAt;
        this.lastChangeDate = family.updatedAt;
        this.family = family;
      }
      this.toggleApproval = function() {
        this.approved = !this.approved;
      }
      this.save = function() {
        var defer = $q.defer();
        this.family.set('approved',this.approved);

        this.family.save()
        .then(
          function(family) {
            defer.resolve(family);
          },
          function(aError) {
            defer.reject(aError);
          });
 
        return defer.promise;
      }
      this.isFamily = function(familyUser, currentUser) {
        var defer = $q.defer();
        var Family = Parse.Object.extend('Family');
        var query = new Parse.Query(Family);
        query.equalTo('family',familyUser);
        query.equalTo('kin',currentUser);
        query.equalTo('approved',true);
        query.first()
          .then(
            function(family) {
              defer.resolve(family);
            },
            function(aError) {
              defer.reject(aError);
            });
        
        return defer.promise;
      }
      /**
       * Constrain list to only family requests for user
       */
      this.list = function(user) {
        var defer = $q.defer();
        var Family = Parse.Object.extend('Family');
        var query = new Parse.Query(Family);
        query.equalTo('family',user);
        query.include('kin');
        query.descending('approved');
        
        query.find()
          .then(
            function(families) {
              defer.resolve(families);
            },
            function(aError) {
              defer.reject(aError);
            });
        
        return defer.promise;
      }
      /**
       * Add current user to family 
       */ 
      this.join = function(userId) {
        var defer = $q.defer();

        Parse.Cloud.run('addToFamily',{userId: userId})
          .then(
            function(response) {
              defer.resolve(response);
            },
            function(error) {
              defer.reject(error);
            });
        
        return defer.promise;
      }
      /**
       * Add current user to family 
       */ 
      this.subscribe = function(userId, status) {
        var defer = $q.defer();

        Parse.Cloud.run('subscribeToFamily',{userId: userId,
                                             status: status})
          .then(
            function(response) {
              defer.resolve(response);
            },
            function(error) {
              defer.reject(error);
            });
        
        return defer.promise;
      }
      /**
       * Check if there are any outstanding requests
       */ 
      this.checkRequests = function(userId) {
        var defer = $q.defer();

        Parse.Cloud.run('unapprovedFamilyRequestCount')
          .then(
            function(response) {
              defer.resolve(response);
            },
            function(error) {
              defer.reject(error);
            });
        
        return defer.promise;
      }
    }    
    return Family;
  });
