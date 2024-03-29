'use strict';
/**
 * Main module for MyFamilyVoice
 */
angular.module('fv', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'angular-tour', 'vcRecaptcha','rcWizard', 'rcForm', 'rcDisabledBootstrap'])
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
      .when('/referral', {
        templateUrl: 'referral/index.html',
        controller: 'ReferralIndexCtrl'
      })
      .when('/referral/add', {
        templateUrl: 'referral/create.html',
        controller: 'ReferralCreateCtrl'
      })
      .when('/wizard', {
        templateUrl: 'wizard/wizard.html',
        controller: 'WizardCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
    
  })
  .run(function($rootScope, $location, CONFIG) {
    Parse.initialize(CONFIG.defaults.parse.applicationId,
                 CONFIG.defaults.parse.javascriptKey);

    // enumerate routes that don't need authentication
    var routesThatDontRequireAuth = ['/search', '/activities', '/login', '/register', '/confirmEmail', '/admin'];
    
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

    });
  });
