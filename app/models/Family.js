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
      /**
       * Constrain list to only activities owned by id
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
      this.checkRequests = function(userId) {
        var defer = $q.defer();

        Parse.Cloud.run('unapprovedFamilyRequestCount',{userId: userId})
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
