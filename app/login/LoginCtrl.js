/* jshint ignore:start */
angular.module('fv')
  .controller('LoginCtrl', function (CONFIG, $scope, $rootScope, $location, User) {
    /**
     *  loginRadius
     */
    var  loginRadius = function() {
      
      var options={};      
      options.login=true;       
      LoginRadius_SocialLogin.util.ready(function () { 
        $ui = LoginRadius_SocialLogin.lr_login_settings;
        $ui.interfacesize = "";
        $ui.apikey = CONFIG.loginRadius.apiKey;
        $ui.callback=""; 
        $ui.lrinterfacecontainer ="interfacecontainerdiv"; 
        LoginRadius_SocialLogin.init(options);  
      }); 
      
      LoginRadiusSDK.onlogin = Successfullylogin;
    }

    function Successfullylogin() {
      LoginRadiusSDK.getUserprofile(function (data) {
        console.log(JSON.stringify(data));
        
        Parse.Cloud.run('loginWithSocialLogin',data)
          .then(
            function(registeredUser) {
              console.log('loginCtrl user was registered');
              return User.logIn(registeredUser.get('password'),
                                registeredUser.get('password'));
            })
          .then(
            function(data) {
              $rootScope.$broadcast('userloggedin');
              console.log(data);
              $location.path('/activities');
            },
            function(error) {
              //Use was not registered
              Parse.Cloud.run('registerSocialLogin', data)
                .then(
                  function(data) {
                    console.log('SuccessfullyLogin register success');
                    console.log(data);
                    //Register and subsequently login
                    return User.signUp(
                      data.get('password'),
                      data.get('password'),
                      data.get('firstName'),
                      data.get('lastName'),
                      data.get('primaryEmail'),
                      true, //isSocial
                      false //verifiedEmail
                    );
                  })
                .then(
                  function(){
                    $rootScope.$broadcast('userloggedin');
                    if ($scope.$$phase || $scope.$root.$$phase) {
                      $scope.$eval($location.path('/account'));
                    } else {
                      $scope.$apply($location.path('/account'));
                    }
                  },
                  function(response) {
                    $('#error').text(response.message);
                  });
            });
      });
    }
    
    /**
     * Init loginRadius
     */
    $scope.init = function() {
      LoginRadius_SocialLogin.util.ready(loginRadius);
    }

    $scope.logIn = function() {
      if ($scope.signupForm.$valid) {
        User.logIn($scope.loginUser.username,
                   $scope.loginUser.password)
          .then(
            function() {
              $rootScope.$broadcast('userloggedin');
              $location.path('/activities');
            }, function(response) {
              $scope.error = response.message;
            });
      } else {
        $scope.signupForm.submitted = true;
      };
    };
  });
/* jshint ignore:end */
