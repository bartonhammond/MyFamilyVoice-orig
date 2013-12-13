'use strict';

angular.module('fv')
  .factory('TagCollection', function ($collection, Tag) {

    //angular-collection https://github.com/tomkuk/angular-collection

    //create the tag collection
    var TagCollection = $collection;
    var tags = TagCollection.getInstance();

    //method for querying
    tags.query = function (query) {
      console.log('query tags');
      Tag.query(query).then(function (response) {
        tags.addAll(response);
      });
    };

    //method for clearing the checked property of each tag in the collection
    tags.clear = function () {
      var clear = tags.all();
      for (var i = 0; i < clear.length; i++) {
        clear[i].checked = false;
      }
    };

    return tags;

  });
