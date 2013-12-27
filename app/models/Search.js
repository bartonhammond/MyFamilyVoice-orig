'use strict';
angular.module('fv').
  factory('Search', function($q) {
    
    var Search = {
      search: function(search) {
        //Trigger email verification if primaryEmail has changed
        
        var defer = $q.defer();
        //Have to pass in attributes or the
        //ones not set, are unset
        Parse.Cloud.run('search', search.q)
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
    return Search;
  });
