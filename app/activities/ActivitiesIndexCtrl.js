'use strict';

angular.module('fv')
  .controller('ActivitiesIndexCtrl', function ($scope, $routeParams, $location, Activity, User, Family, $modal) {
    $scope.user = '';
    $scope.family = '';
    $scope.modalData = undefined;

    $scope.showModal = function(index) {
      /* jshint unused: false*/
      var modalInstance = $modal.open({
        templateUrl: 'myModalContentActivities.html',
        controller: 'ModalInstanceActivitiesCtrl',
        resolve: {
          modalData: function () {
            return $scope.activities[index];
          }
        }
      });
    };
    /**
     * Make url point to server to proxy stream content
     */
    $scope.proxyUrl = function(obj) {
      //http://files.parse.com/3e0d5059-d213-40a3-a224-44351b90a9d1/cb8020bb-6210-440a-b69f-6c62bb9cb1a4-recording.mp3
      return obj ? obj._url.replace('http://files.parse.com','/parse') : '';
    };
    $scope.authenticated = function() {
      return Parse.User.current() && Parse.User.current().authenticated();
    };

    var getRelations = function(item) {
      item.activity.relation('likes').query().find()
        .then(
          function(likes) {
            item.likes = [];
            item.iLikeThis = false;
            _.each(likes, function(user) {
              item.likes.push(new User(user));
              if (Parse.User.current() && Parse.User.current().authenticated() && user.id === Parse.User.current().id) {
                item.iLikeThis = true;
                if(!$scope.$$phase) {
                  $scope.$digest();
                }
              }
            });
          },
          function(error) {
            console.log(error);
          });
    };
    var getUsersActivities = function(user) {
      (new Activity()).list(user)
        .then(
          function(activities) {
            var _activities = [];
            _.each(activities, function(act) {
              var activity = new Activity(act);
              activity.isLikeCollapsed = true;
              getRelations(activity);
              _activities.push(activity);
            });
            $scope.activities = _activities;
          },
          function(error) {
            console.log(error.message);
            window.history.back();
          });
    };
    $scope.showLikes = function(activity) {
      activity.isLikeCollapsed = !activity.isLikeCollapsed;
    };
    /**
     * action = true to like
     *          false to unlike
     */
    $scope.like = function(activity, action) {
      activity.isLikeCollapsed = true;
      if (!action) {
        activity.iLikeThis = false;
      }
      (new Activity()).like(activity.id, action)
      .then(
        function(updatedActivity) {
          activity.liked = updatedActivity.get('liked');
          activity.activity = updatedActivity;
          getRelations(activity);
          if(!$scope.$$phase) {
            $scope.$digest();
          }
        },
        function(error) {
          console.log(error);
        });
    };

    $scope.init = function() {
      //id is set when viewing Activities for a specific user
      if ($routeParams.id) {
        (new User()).get($routeParams.id)
          .then(
            function(familyUser) {
              $scope.user = familyUser;
              return (new Family()).isFamily(familyUser, Parse.User.current());
            })
          .then(
            function(family) {
              $scope.family = family;
              getUsersActivities($scope.user);
            },
            function(error) {
              console.log(error.message);
              window.history.back();
            });
      } else {
        $scope.user = Parse.User.current();
        getUsersActivities(Parse.User.current());
      }

    };

    $scope.doesUserHaveWriteAccess = function() {
      if (Parse.User.current() && $scope.user) {
        return Parse.User.current().id === $scope.user.id || $scope.family;
      } else {
        return false;
      }
    };

    $scope.isOwner = function(index) {
      var activity = $scope.activities[index];
      var ownerId = activity.activity.get('user').id;
      return Parse.User.current() && Parse.User.current().id === ownerId;
    };

    $scope.hasWriteAccess = function(index) {
      var activity = $scope.activities[index];
      return activity.getACL().getWriteAccess(Parse.User.current().id);
    };
    
    //file contains 'http:...' and the : causes problems
    $scope.hasThumbnail = function(index) {
      var activity = $scope.activities[index];
      return !_.isUndefined(activity.thumbnail);
    };
    
    //file contains 'http:...' and the : causes problems
    $scope.hasFile = function(index) {
      var activity = $scope.activities[index];
      return !_.isUndefined(activity.file);
    };

    $scope.edit = function(activity) {
      $location.path('/activities/edit/' + activity.id);
    };

    $scope.record = function(activity) {
      $location.path('/activities/record/' + activity.id);
    };

    $scope.newQuestion = function() {
      if ($scope.family) {
        $location.path('/activities/add/'+ $scope.family.get('family').id);
      } else {
        $location.path('/activities/add');
      }
    };
    /**
     * update the count of listened to
     */
    $scope.listened = function(obj, event) {
      if (event.currentTarget && event.currentTarget.paused) {
        (new Activity()).listened(obj.id,
                                  obj.activity.get('user').id)
          .then(function (activity) {
            obj.views = activity.get('views');
          }, function(error) {
            console.log(error);
          });
      }
    };
    
    //delete from parse and remove from the collection
    $scope.delete = function(activity) {
      console.log(activity);
      console.log('delete not implemented');
    };
  }).controller('ModalInstanceActivitiesCtrl',function ($scope, $modalInstance, modalData, Activity) {
    
    $scope.modalData = modalData;
    $scope.listened = function() {
      (new Activity()).listened($scope.modalData.objectId,
                                $scope.modalData.userId);
    };
    /**
     * Make url point to server to proxy stream content
     */
    $scope.proxyUrl = function(obj) {
      //http://files.parse.com/3e0d5059-d213-40a3-a224-44351b90a9d1/cb8020bb-6210-440a-b69f-6c62bb9cb1a4-recording.mp3
      return obj ? obj._url.replace('http://files.parse.com','/parse') : '';
    };
   
    $scope.ok = function () {
      $modalInstance.close();
    };
    
  });
