'use strict';

angular.module('parseApp')
  .controller('ActivitiesRecorderCtrl', function ($scope, $routeParams, $location, ActivityCollection, TagCollection, AudioCollection, Activity, Tag, Audio,  Auth) {


    //if this is an edit request, it will have an objectId parameter
    if($routeParams.id) {

      //let's find the activity object from our collection of activities
      var activity = ActivityCollection.getByObjectId($routeParams.id);

      if(!activity) {
        return $location.path('/activities');
      }

      //generate a date object from the parse date
      $scope.date = new Date(activity.date.iso);

      $scope.activity = activity;

    }


    //save this activity
    $scope.save = function() {

      var activity = $scope.activity;

      activity.$put().then(function() {
          $location.path('/activities');
      });
    }

    $scope.setFiles = function(element) {
      $scope.audio = Audio.create({});
      $scope.audio.file = element.files[0];
    }
    $scope.uploadFile = function() {
      console.log('uploadFile');
      $scope.audio.$saveFile('audio', $scope.audio.file).then(function(data) {
        //add it to the collection
        AudioCollection.add($scope.audio);
        activity.file = data.url;
        activity.recoredDate = $scope.date;
        activity.$put().then(function() {
          $location.path('/activities');
        });
      });
    }
  });
