/* jshint ignore:start */
angular.module('fv')
  .controller('LoginCtrl', function (CONFIG, $scope, $rootScope, $location, $routeParams, $q, User, Referral, requestNotificationChannel) {
    /**
     *  loginRadius
     */
    var  loginRadius = function() {
      var options={};
      options.login=true;

      LoginRadius_SocialLogin.util.ready(function () {

        $ui = LoginRadius_SocialLogin.lr_login_settings;
        $ui.interfacesize = '';
        $ui.apikey = CONFIG.defaults.loginRadius.apiKey;
        $ui.callback='';
        $ui.lrinterfacecontainer ='interfacecontainerdiv';

        LoginRadius_SocialLogin.init(options);
      });
      LoginRadiusSDK.onlogin = Successfullylogin;

    };
    /**
     * Return promise from either signing up a new user
     * or updateing the user created during the referral process
     */
    var registerOrReferral = function(registeredUser) {
      var defer = $q.defer();
      if (!_.isUndefined($rootScope.loginLink)) {
        (new Referral()).updateReferredUser(registeredUser.get('username'),
                                            registeredUser.get('password'),
                                            true, //isSocial
                                            $rootScope.loginLink,
                                            registeredUser.get('firstName'),
                                            registeredUser.get('lastName'),
                                            registeredUser.get('primaryEmail'))
          .then(
            function() {
              return (new User()).logIn(registeredUser.get('username'),
                                        registeredUser.get('password'));
            })
          .then(
            function() {
              $rootScope.loginLink = undefined;
              defer.resolve();
            },
            function(error) {
              defer.reject(error);
            });
      } else {
        //Register and subsequently login
        (new User()).signUp(
          registeredUser.get('username'),
          registeredUser.get('password'),
          registeredUser.get('firstName'),
          registeredUser.get('lastName'),
          registeredUser.get('primaryEmail'),
          true, //isSocial
          false //verifiedEmail
        ).then(
          function() {
            defer.resolve();
          },
          function(error) {
            defer.reject(error);
          });
      }
      return defer.promise;
    };

    function Successfullylogin() {
      LoginRadiusSDK.getUserprofile(function (data) {
        requestNotificationChannel.requestStarted();
        Parse.Cloud.run('loginWithSocialLogin',data)
          .then(
            function(registeredUser) {
              console.log('loginCtrl user was registered');
              return (new User()).logIn(registeredUser.get('username'),
                                        registeredUser.get('password'));
            })
          .then(
            function() {
              $rootScope.$broadcast('userloggedin');
              $location.path('/activities');
              requestNotificationChannel.requestEnded();
            },
            function() {
              //Use was not registered
              Parse.Cloud.run('registerSocialLogin', data)
                .then(
                  function(registeredUser) {
                    return registerOrReferral(registeredUser);
                  })
                .then(
                  function(){
                    requestNotificationChannel.requestEnded();
                    $rootScope.$broadcast('userloggedin');
                    if ($scope.$$phase || $scope.$root.$$phase) {
                      $scope.$eval($location.path('/account'));
                    } else {
                      $scope.$apply($location.path('/account'));
                    }
                  },
                  function(response) {
                    requestNotificationChannel.requestEnded();
                    $('#error').text(response.message);
                  });
            });

      });
    };
    
    /**
     * Init loginRadius
     */
    $scope.init = function() {
      /* jshint camelcase: false*/
      LoginRadius_SocialLogin.util.ready(loginRadius);
      if ($routeParams.link) {
        $rootScope.loginLink = $routeParams.link;
      }
    };

    $scope.logIn = function() {
      if ($scope.signupForm.$valid) {
        requestNotificationChannel.requestStarted();
        (new User()).logIn($scope.loginUser.username,
                   $scope.loginUser.password)
          .then(
            function() {
              $rootScope.$broadcast('userloggedin');
              $location.path('/activities');
            }, function(response) {
              $scope.error = response.message;
            })
          .finally(
            function() {
              requestNotificationChannel.requestEnded();
            });
      } else {
        $scope.signupForm.submitted = true;
      }
    };
  });
/* jshint ignore:end */
