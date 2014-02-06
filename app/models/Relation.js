'use strict';
angular.module('fv').
  factory('Relation', function() {
    
    var Relation = function(relation) {
      if (!_.isUndefined(relation)) {
        this.relation = JSON.stringify(relation.toJSON());
      }
    };
    return Relation;
  });
