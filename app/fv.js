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
      .when('/confirmFamily/:link', {
        templateUrl: 'family/confirmFamily.html',
        controller: 'ConfirmFamilyCtrl'
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
      .when('/family', {
        templateUrl: 'family/index.html',
        controller: 'FamilyIndexCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    
  }).run(function($rootScope, $location, Family) {
    // enumerate routes that don't need authentication
    var routesThatDontRequireAuth = ['/login', '/register', '/confirmEmail', '/confirmFamily', '/admin'];
    
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
      if (Parse.User.current()) {
        (new Family()).checkRequests(Parse.User.current().id)
          .then(
            function(count) {
              $rootScope.$broadcast('newfamilyrequests',count);
            });
      };
      
    });
})
    
