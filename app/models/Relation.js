'use strict';
angular.module('fv').
  factory('Relation', function($q) {
    
    var Relation = function(relation) {
      if (!_.isUndefined(relation)) {
        this.relation = JSON.stringify(relation.toJSON());
      }
    }
    return Relation;
  });
