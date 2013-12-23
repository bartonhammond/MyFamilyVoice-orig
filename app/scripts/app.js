'use strict';

angular.module('fv', ['ngRoute', 'ngSanitize', 'parseResource', 'ngCollection'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/account', {
        templateUrl: 'views/account.html',
        controller: 'AccountCtrl',
        auth: true
      })
      .when('/confirmEmail/:link', {
        templateUrl: 'views/confirmEmail.html',
        controller: 'ConfirmEmailCtrl'
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
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
      .when('/activities/record/:id', {
        templateUrl: 'views/activities/record.html',
        controller: 'ActivitiesRecorderCtrl',
        auth: true
      })
      .when('/activities', {
        templateUrl: 'views/activities/index.html',
        controller: 'ActivitiesIndexCtrl',
        auth: true
      })
      .otherwise({
        redirectTo: '/'
      });

  }).run(function(Auth, $rootScope, $location) {
    //try and restore the user session from localstore
    Auth.restore();
    
    // enumerate routes that don't need authentication
    var routesThatDontRequireAuth = ['/login', '/register', '/confirmEmail'];
    
    // check if current location matches route  
    var routeClean = function (route) {
      if (route === '/') {
        return true;
      }
      return _.find(routesThatDontRequireAuth,
                    function (noAuthRoute) {
                      return route.indexOf(noAuthRoute) > -1;
                    });
    };
    
    $rootScope.$on('$routeChangeStart', function () {
      // if route requires auth and user is not logged in
      if (!routeClean($location.url()) &&  !Auth.isAuthenticated()) {
        // redirect back to login
        $location.path('/login');
      }
    });
  }).constant('PARSE_CONFIG',
              { defaultHeaders:
                {'X-Parse-Application-Id' : '6stx2NYQVpHKrlYL28NegU4vYAV76VRPWqMwAvZd',
                 'X-Parse-REST-API-Key' : 'cimfrb1oGtjKotgSOqWPFc0ZRckbKSEEZFUmjVp2'
                },
                defaultParams:{}
              }
             )
;
