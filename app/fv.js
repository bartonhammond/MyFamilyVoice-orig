'use strict';
/**
 * Main module for MyFamilyVoice
 */
angular.module('fv', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'angular-tour'])
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
      .when('/login/:link', {
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
      .when('/register', {
        templateUrl: 'register/register.html',
        controller: 'RegisterCtrl'
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
      .when('/referral', {
        templateUrl: 'referral/index.html',
        controller: 'ReferralIndexCtrl'
      })
      .when('/referral/add', {
        templateUrl: 'referral/create.html',
        controller: 'ReferralCreateCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    
  })
  .config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      // Allow loading from our assets domain.  Notice the difference between * and **.
      'http://files.parse.com/**'
    ]);
    
    // The blacklist overrides the whitelist so the open redirect here is blocked.
    $sceDelegateProvider.resourceUrlBlacklist([
    ]);
  })
  .run(function($rootScope, $location, Family, CONFIG) {
    Parse.initialize(CONFIG.defaults.parse.applicationId,
                 CONFIG.defaults.parse.javascriptKey);

    // enumerate routes that don't need authentication
    var routesThatDontRequireAuth = ['/search', '/activities', '/login', '/register', '/confirmEmail', '/confirmFamily', '/admin'];
    
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
      var route = routeClean($location.url());
      if (!route) {
        // redirect back to login
        if (!Parse.User.current()) {
          $location.path('/login');
        }
      }

      
      if (!_.isNull(Parse.User.current()) && Parse.User.current().authenticated()) {
        (new Family()).checkRequests(Parse.User.current().id)
          .then(
            function(count) {
              $rootScope.$broadcast('newfamilyrequests',count);
            });
      }
      
    });
  });
