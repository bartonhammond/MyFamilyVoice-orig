'use strict';

angular.module('parseApp', ['ngRoute', 'ngSanitize', 'parseResource', 'ngCollection', '$strap.directives'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/activities', {
        templateUrl: 'views/activities/index.html',
        controller: 'ActivitiesIndexCtrl',
        auth: true
      })
      .when('/activities/add', {
        templateUrl: 'views/activities/update.html',
        controller: 'ActivitiesUpdateCtrl',
        auth: true
      })
      .when('/activities/edit/:id', {
        templateUrl: 'views/activities/update.html',
        controller: 'ActivitiesUpdateCtrl',
        auth: true
      })
      .otherwise({
        redirectTo: '/'
      });

  })
  .run(function(Auth, $rootScope, $location) {
    //try and restore the user session from localstore
    Auth.restore();

    if(Auth.isAuthenticated()) {
      $location.path('/activities');
    }

    //redirect unauthenticated users to login page if they try and access pages that require auth
    $rootScope.$on("$routeChangeStart", function (event, next, current) {

      if(next.$$route.auth && !Auth.isAuthenticated()) {
        return $location.path('/');
      }

    });

});



angular.module('parseApp')
  .constant('PARSE_CONFIG',{
    defaultHeaders: {
      'X-Parse-Application-Id' : '6stx2NYQVpHKrlYL28NegU4vYAV76VRPWqMwAvZd',
      'X-Parse-REST-API-Key' : 'cimfrb1oGtjKotgSOqWPFc0ZRckbKSEEZFUmjVp2'
    },
    defaultParams: {}
  }
);
