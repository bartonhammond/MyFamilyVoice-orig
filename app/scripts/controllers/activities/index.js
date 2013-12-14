'use strict';

angular.module('fv')
  .controller('ActivitiesIndexCtrl', function ($scope, $location, ActivityCollection, TagCollection, Auth) {

    //if the collection is empty query parse
    if(ActivityCollection.size() === 0) {
      ActivityCollection.query({
        //include: 'tags',
        where: {
          user: {
            '__type': 'Pointer',
            'className': '_User',
            'objectId': Auth.me().objectId
          }
        }
      });
    }

    //if the tag collection is empty, let's get all the tags as well
    if(TagCollection.size() === 0) {
      TagCollection.query({
        where: {
          user: {
            '__type': 'Pointer',
            'className': '_User',
            'objectId': Auth.me().objectId
          }
        }
      });
    };
    //file contains "http:..." and the : causes problems
    $scope.hasFile = function(index) {
      var activity = $scope.activities[index];
      return !_.isUndefined(activity.file);
    }
    //add the activities to the scope
    $scope.activities = ActivityCollection.all();

    $scope.edit = function(activity) {
      $location.path('/activities/edit/' + activity.objectId);
    }
    $scope.record = function(activity) {
      $location.path('/activities/record/' + activity.objectId);
    }
    $scope.newQuestion = function() {
      $location.path('/activities/add');
    }

    //delete from parse and remove from the collection
    $scope.delete = function(activity) {
      activity.$delete().then(function() {
        ActivityCollection.remove(activity);
      });
    }
    
  });
