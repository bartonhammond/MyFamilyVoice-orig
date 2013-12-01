'use strict';

angular.module('parseApp')
  .factory('AudioCollection', function ($collection, Audio) {

    //angular-collection https://github.com/tomkuk/angular-collection

    //create the new collection
    var AudioCollection = $collection;
    var audios  = AudioCollection.getInstance();

    //add a method for querying
    audios.query = function (query) {
      console.log('query activities');
      Audio.query(query).then(function (response) {
        audios.addAll(response);
      });
    };

    return audios;

  });
