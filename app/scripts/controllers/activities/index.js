'use strict';

angular.module('parseApp')
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

    //add the activities to the scope
    $scope.activities = ActivityCollection.all();

    $scope.edit = function(activity) {
      $location.path('/activities/edit/' + activity.objectId);
    }

    //delete from parse and remove from the collection
    $scope.delete = function(activity) {
      activity.$delete().then(function() {
        ActivityCollection.remove(activity);
      });
    }

  });
