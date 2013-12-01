'use strict';

angular.module('parseApp')
  .factory('ActivityCollection', function ($collection, Activity) {

    //angular-collection https://github.com/tomkuk/angular-collection

    //create the new collection
    var ActivityCollection = $collection;
    var activities = ActivityCollection.getInstance();

    //add a method for querying
    activities.query = function (query) {
      console.log('query activities');
      Activity.query(query).then(function (response) {
        activities.addAll(response);
      });
    };

    return activities;

  });
