'use strict';

// Declare module which depends on filters, and services
angular.module('fv')
// Declare an http interceptor that will signal the start and end of each request
  .config(['$httpProvider', function ($httpProvider) {
    var $http,
      interceptor = ['$q', '$injector', function ($q, $injector) {
        var notificationChannel,
          timeout,
          $timeout;

        /***
         * Wait 1 second to see if there are more pending requests
         */
        function waitAndSee() {
          $timeout = $timeout || $injector.get('$timeout');
          timeout = $timeout(function () {
            // get $http via $injector because of circular dependency problem
            $http = $http || $injector.get('$http');
            // don't send notification until all requests are complete
            if ($http.pendingRequests.length < 1) {
              //  console.log('requestEnded');
              // get requestNotificationChannel via $injector because of circular dependency problem
              notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
              // send a notification requests are complete
              notificationChannel.requestEnded();
              $timeout.cancel(timeout);
            }
          }, 1000);
        }

        function success(response) {
          waitAndSee();
          return response;
        }

        function error(response) {
          waitAndSee();
          return $q.reject(response);
        }

        return function (promise) {
          $http = $http || $injector.get('$http');
          // get requestNotificationChannel via $injector because of circular dependency problem
          notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
          // send a notification requests are complete
          notificationChannel.requestStarted();
          return promise.then(success, error);
        }
      }];

    $httpProvider.responseInterceptors.push(interceptor);
  }])
// declare the notification pub/sub channel
  .factory('requestNotificationChannel', ['$rootScope', function($rootScope){
    // private notification messages
    var _START_REQUEST_ = '_START_REQUEST_';
    var _END_REQUEST_ = '_END_REQUEST_';

    // publish start request notification
    var requestStarted = function() {
      $rootScope.$broadcast(_START_REQUEST_);
    };
    // publish end request notification
    var requestEnded = function() {
      $rootScope.$broadcast(_END_REQUEST_);
    };
    // subscribe to start request notification
    var onRequestStarted = function($scope, handler){
      $scope.$on(_START_REQUEST_, function(event){
        handler();
      });
    };
    // subscribe to end request notification
    var onRequestEnded = function($scope, handler){
      $scope.$on(_END_REQUEST_, function(event){
        handler();
      });
    };

    return {
      requestStarted:  requestStarted,
      requestEnded: requestEnded,
      onRequestStarted: onRequestStarted,
      onRequestEnded: onRequestEnded
    };
  }])
// declare the directive that will show and hide the loading widget
  .directive('loading', ['requestNotificationChannel',  function (requestNotificationChannel) {
    return {
      replace: true,
      restrict: "E",
      // The actual html that will be used
      template: '<div id="loading-container"><div id="loading"><img src="images/spinner.gif"></img><span>Loading..</span>.</div></div>',

      link: function ($scope, $element) {
        if ($scope.loading) {
          $scope.loading.element = $element;
        }

        var startRequestHandler = function() {
          $scope.start();
        };

        var endRequestHandler = function() {
          $scope.complete();
        };
        
        requestNotificationChannel.onRequestStarted($scope, startRequestHandler);
        
        requestNotificationChannel.onRequestEnded($scope, endRequestHandler);
        
      },
      controller: ['$scope', '$timeout', '$location', function($scope, $timeout, $location) {
        $scope.loading = {
          count: 0
        };

        $scope.show = function() {
          $scope.loading.element.children().css('opacity', '1');
          $scope.loading.element.show();
        }

        $scope.start = function() {
          if (!$scope.loading.element.is(':visible')) {
            $scope.show();
          }
        };

        $scope.complete = function() {
          if ($scope.loading.element.is(':visible')) {
            $scope.loading.element.hide();
            $scope.loading.element.children().css('opacity', '1');
          }
        }
      }]//controller
    };
  }]);
