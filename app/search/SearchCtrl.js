'use strict';

angular.module('fv')
  .controller('SearchCtrl', function ($scope, $location, Search, Activity, Family, $modal) {
    $scope.init = function() {
      $scope.search = {};
      $scope.search.q = '';
      $scope.performSearch();
      $scope.familyRequestSent = false;
      $scope.modalData = undefined;
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
    /**
     * Search 
     */
    $scope.performSearch = function() {
      Search.search($scope.search)
        .then(
          function(response) {
            $scope.search.items = response;
          },
          function(error) {
            console.log(error);
          });
    };
    /**
     * On search, only Users have Join Family
     */
    $scope.joinFamily = function(index) {
      (new Family()).join($scope.search.items[index].objectId)
        .then(
          function() {
            $scope.search.items[index].familyRequestSent = true;
          },
          function(error) {
            console.log(error);
          });
    };
    /**
     * Make url point to server to proxy stream content
     */
    $scope.proxyUrl = function(obj) {
      //http://files.parse.com/3e0d5059-d213-40a3-a224-44351b90a9d1/cb8020bb-6210-440a-b69f-6c62bb9cb1a4-recording.mp3
      return obj ? obj._url.replace('http://files.parse.com','/parse') : '';
    };

    /**
     * On search, only Users have Join Family
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
     * Start player and update the count of listened to
     */
    $scope.listened = function(obj) {
      (new Activity()).listened(obj.objectId,
                                obj.userId);
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
