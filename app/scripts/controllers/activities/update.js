'use strict';

angular.module('parseApp')
  .controller('ActivitiesUpdateCtrl', function ($scope, $routeParams, $location, ActivityCollection, TagCollection, AudioCollection, Activity, Tag, Audio,  Auth) {

    //get the list of tags, and clear off all the checkmarks
    $scope.tags = TagCollection.all();
    TagCollection.clear();

    //if this is an edit request, it will have an objectId parameter
    if($routeParams.id) {

      //let's find the activity object from our collection of activities
      var activity = ActivityCollection.getByObjectId($routeParams.id);

      if(!activity) {
        return $location.path('/activities');
      }

      //generate a date object from the parse date
      $scope.date = new Date(activity.date.iso);

      //check off the tags that are included with this activity
      for(var i = 0; i < activity.tags.length; i ++) {
        var tag = TagCollection.getByObjectId(activity.tags[i].objectId);
        tag.checked = true;
      }

      $scope.activity = activity;

    } else {
      //this is a new entry, use today's date and create a new
      //activity object
      $scope.activity = Activity.create({});
      //need to offset the date to overcome timezone issues
      var date = new Date();
      var offset = date.getTimezoneOffset();
      date = new Date(date.getTime() + offset * 60000);
      $scope.activity.$setJsDate('date', date);

    }

    $scope.newTag = '';

    //save this activity
    $scope.save = function() {

      var activity = $scope.activity;

      //build an array of checked off tags
      var tags = [];
      angular.forEach($scope.tags, function(value) {
        if (value.checked) {
          tags.push({'className': 'Tag', 'objectId': value.objectId, 'name': value.name});
        }
      });
      activity.tags = tags;

      //if it's new link the user and create the ACL object
      if(activity.$isNew()) {
        var userId = Auth.me().objectId;
        activity.user = {'__type': 'Pointer', 'className': '_User', 'objectId': userId};
        activity.ACL = {}
        activity.ACL[userId] = {read: true, write: true};
      }


      //post to parse if new, put if updating
      if(activity.$isNew()) {
        activity.$post().then(function() {
          //add this new activity to the collection
          ActivityCollection.add(activity);
          $location.path('/activities');
        });
      } else {
        activity.$put().then(function() {
          $location.path('/activities');
        });
      }
    }
    //save a new tag
    $scope.saveTag = function() {

      if($scope.newTag.trim().length > 0) {
        var userId = Auth.me().objectId;

        //create the tag parse object
        var tag = new Tag({
          name: $scope.newTag,
          user: {'__type': 'Pointer', 'className': '_User', objectId: userId},
          ACL: {}
        });
        tag.ACL[userId] = {read: true, write: true}

        tag.$post().then(function() {
          //add it to the tag collection
          TagCollection.add(tag);
        });

        $scope.newTag = '';
      }

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
        activity.$put().then(function() {
          $location.path('/activities');
        });
      });
    }
  });
