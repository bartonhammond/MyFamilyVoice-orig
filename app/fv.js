'use strict';
/* global Parse */
Parse.initialize('6stx2NYQVpHKrlYL28NegU4vYAV76VRPWqMwAvZd',
                 'Exehq2ao7JVaSrq2LrBwPF1iehv8cYsGIKfBWsqS');

angular.module('fv', ['ngRoute', 'ngSanitize', 'ngCollection'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'main/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl: 'login/login.html',
        controller: 'LoginCtrl'
      })
      .when('/admin', {
        templateUrl: 'admin/index.html',
        controller: 'AdminCtrl'
      })
      .when('/confirmEmail/:link', {
        templateUrl: 'confirmEmail/confirmEmail.html',
        controller: 'ConfirmEmailCtrl'
      })
      .when('/account', {
        templateUrl: 'account/account.html',
        controller: 'AccountCtrl'
      })
      .when('/activities', {
        templateUrl: 'activities/index.html',
        controller: 'ActivitiesIndexCtrl'
      })
      .when('/activities/list/:id', {
        templateUrl: 'activities/index.html',
        controller: 'ActivitiesIndexCtrl'
      })
      .when('/activities/:action/:id', {
        templateUrl: 'activities/update.html',
        controller: 'ActivitiesUpdateCtrl'
      })
      .when('/activities/:action', {
        templateUrl: 'activities/update.html',
        controller: 'ActivitiesUpdateCtrl'
      })
      .when('/search', {
        templateUrl: 'search/search.html',
        controller: 'SearchCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    
/**
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })

      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })

      .when('/search', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl',
        auth: true
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
      .when('/admin', {
        templateUrl: 'views/admin/index.html',
        controller: 'AdminCtrl',
        admin: true
      })

      .otherwise({
        redirectTo: '/'
      });
*/
  }).run(function($rootScope, $location) {
    // enumerate routes that don't need authentication
    var routesThatDontRequireAuth = ['/login', '/register', '/confirmEmail', '/admin'];
    
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
      if (!routeClean($location.url()) &&  !Parse.User.current()) {
        // redirect back to login
        $location.path('/login');
      }
    });
  });
