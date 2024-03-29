'use strict';
angular.module('fv').
  factory('Search', function($q) {
    
    var Search = {
      search: function(search) {
        
        var defer = $q.defer();

        Parse.Cloud.run('search', {q: search.q, option: search.option, userId: search.userId})
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
