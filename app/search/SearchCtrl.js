'use strict';

angular.module('fv')
  .controller('SearchCtrl', function ($scope, $location, $window, User, Search, Activity, Family, $modal, requestNotificationChannel) {
    var placeHolder = {};
    placeHolder.my = 'My stories';
    placeHolder.all = 'All stories';
    placeHolder.memorial = 'Memorials';
    
    $scope.init = function() {
      $scope.dropdown = false;

      $scope.$on('onTourEnd', function() {
        $location.path('/login');
      });

      $scope.authenticated =  !_.isNull(Parse.User.current()) &&
        Parse.User.current().authenticated();
      
      $scope.verifiedUser = $scope.authenticated &&
        Parse.User.current().get('verifiedEmail') &&
        Parse.User.current().get('recaptcha');
      
      $scope.verifiedEmail = $scope.authenticated &&
        Parse.User.current().get('verifiedEmail');

      $scope.recaptcha = $scope.authenticated &&
        Parse.User.current().get('recaptcha');

      $scope.modalData = undefined;

      $scope.search = {};
      $scope.search.q = '';
      $scope.search.option = 'all';
      
      $scope.option($scope.search.option);
    };

    $scope.checkForEnter = function(ev) {
      if (ev.which === 13) {
        search();
      }
    };

    $scope.option = function(val) {
      $scope.search.option = val;
      $scope.search.q = '';
      $('#searchTerm').attr('placeholder', placeHolder[val]);
      $scope.dropdown = false;
      $window.onclick = null;
      search();
    };
    
    $scope.dropdownToggle = function() {
      $scope.dropdown = !$scope.dropdown;
      if ($scope.dropdown) {
        $window.onclick = function (event) {
          closeSearchWhenClickingElsewhere(event, $scope.dropdownToggle);
        };
      } else {
        $scope.dropdown = false;
        $window.onclick = null;
        if (!($scope.$$phase || $scope.$root.$$phase)) {
          $scope.$apply();
        }
      }
      
    };
    function closeSearchWhenClickingElsewhere(event, callbackOnClose) {
      
      var clickedElement = event.target;
      if (!clickedElement) {
        return;
      }

      var elementClasses = clickedElement.classList;

      var clickedOnSearchDrawer = elementClasses.contains('searchOption') ||
        (clickedElement.parentElement !== null && clickedElement.parentElement.classList.contains('searchOption'));
      
      if (!clickedOnSearchDrawer) {
        callbackOnClose();
        return;
      }
      
    }

    $scope.goHome = function(event) {
      console.log('going home');
      console.log(event.which);
      $location.path('/');
    };

    $scope.$watch('search.q', function() {
      $scope.performSearch();
    });

    $scope.showTour = function() {
      $scope.$broadcast('show');
    };

    $scope.hideTour = function() {
      $scope.$broadcast('hide');
    };

    $scope.addStory = function(index) {
      $scope.search.items[index].hideAddStory = !$scope.search.items[index].hideAddStory;
    };
    /**
     * Likes array clicked
     */
    $scope.showUserLikingThis = function(item, index) {
      $scope.search.option = 'user';
      $scope.search.q = '';
      $scope.search.userId = item.likes[index].userId;
      $('#searchTerm').attr('placeholder', item.likes[index].firstName + ' ' + item.likes[index].lastName);
      search();
    };
    /*
     * Activity user clicked
     */
    $scope.showUserForActivity = function(index) {
      $scope.search.option = 'user';
      $scope.search.q = '';
      $scope.search.userId = $scope.search.items[index].userId;
      $('#searchTerm').attr('placeholder', $scope.search.items[index].username);
      search();
    };
    /*
     * User clicked
     */
    $scope.showUser = function(index) {
      $scope.search.option = 'user';
      $scope.search.q = '';
      $scope.search.userId = $scope.search.items[index].objectId;
      $('#searchTerm').attr('placeholder', $scope.search.items[index].description);
      search();
    };
    $scope.showModal = function(index) {
      /* jshint unused: false*/
      var modalInstance = $modal.open({
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        resolve: {
          modalData: function () {
            return $scope.search.items[index];
          }
        }
      });
    };
    $scope.showLikes = function(activity) {
      activity.isLikeCollapsed = !activity.isLikeCollapsed;
    };
    /**
     * Search 
     */
    $scope.performSearch = function() {
      if ($scope.search.q.length < 5) {
        return;
      }
      search();
    };
    var search = function() {
      requestNotificationChannel.requestStarted();
      Search.search($scope.search)
        .then(
          function(response) {
            $scope.search.items = response;
          })
        .finally(
          function() {
            requestNotificationChannel.requestEnded();
          });
    };

    /**
     * action = true to like
     *          false to unlike
     */
    $scope.like = function(activity, action) {
      if (!$scope.processingLike) {
        $scope.processingLike = true;
        activity.isLikeCollapsed = true;
        activity.liked = action ? activity.liked + 1 : activity.liked -1;
        activity.iLikeThis = action;
        if (action) {
          activity.likes.push({userId: Parse.User.current().id,
                               firstName: Parse.User.current().get('firstName'),
                               lastName: Parse.User.current().get('lastName')});
        } else {
          activity.likes = _.filter(activity.likes, function(user) {
            return user.userId !== Parse.User.current().id;
          });
        }

        (new Activity()).like(activity.objectId, action)
          .then(
            function() {
              $scope.processingLike = false;
            },
            function(error) {
              console.log(error);
            });
      } else {
        return false;
      }
    };
    $scope.userThumbnail = function() {
      if (Parse.User.current() && Parse.User.current().authenticated) {
        return $scope.proxyUrl(Parse.User.current().get('thumbnail'));
      } else {
        return '';
      }
    };
    /**
     * Make url point to server to proxy stream content
     */
    $scope.proxyUrl = function(obj) {
      //http://files.parse.com/3e0d5059-d213-40a3-a224-44351b90a9d1/cb8020bb-6210-440a-b69f-6c62bb9cb1a4-recording.mp3
      return obj ? obj._url.replace('http://files.parse.com','/parse') : '';
    };

    /**
     * On search, only Users can subscribe
     */
    $scope.subscribe = function(index) {
      var userId = $scope.search.items[index].objectId;
      var status = $scope.search.items[index].subscribed;
      (new Family()).subscribe(userId, !status)
        .then(
          function() {
            $scope.search.items[index].isSubscribed = !status;
          },
          function(error) {
            console.log(error);
          });
    };
    /**
     *  update the count of listened to
     */
    $scope.listened = function(obj, event) {
      if (event.currentTarget.paused) {
        (new Activity()).listened(obj.objectId,
                                  obj.userId)
          .then(function (activity) {
            obj.views = activity.get('views');
          }, function(error) {
            console.log(error);
          });
      }
    };
    $scope.edit = function(activity) {
      $location.path('/activities/edit/' + activity.objectId);
    };

    $scope.record = function(activity) {
      $location.path('/activities/record/' + activity.objectId);
    };

    $scope.newQuestion = function() {
      $location.path('/activities/add');
    };
    
  }).controller('ModalInstanceCtrl',function ($scope, $modalInstance, modalData, Activity) {
    
    $scope.modalData = modalData;
    $scope.listened = function(event) {
      if (event.currentTarget.paused) {
        (new Activity()).listened($scope.modalData.objectId,
                                  $scope.modalData.userId);
      }
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
