'use strict';
angular.module('fv').
  factory('Family', function($q) {
    
    var Family = {
      join: function(userId) {
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
      },
      checkRequests: function(userId) {
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
