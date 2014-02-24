'use strict';
angular.module('fv').
  factory('Search', function($q) {
    
    var Search = {
      search: function(q) {
        
        var defer = $q.defer();

        Parse.Cloud.run('search', {q: q})
          .then(
            function(response) {
              defer.resolve(response);
            },
            function(error) {
              defer.reject(error);
            });
        
        return defer.promise;
      }
    };
    return Search;
  });
