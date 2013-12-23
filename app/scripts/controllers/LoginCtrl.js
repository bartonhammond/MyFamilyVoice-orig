    /* jshint ignore:start */
angular.module('fv')
  .controller('LoginCtrl', function ($scope, $rootScope, Auth, RegisterUser, $location) {
    /**
     *  loginRadius
     */
    var  loginRadius = function() {

      var options={};      
      options.login=true;       
      LoginRadius_SocialLogin.util.ready(function () { 
        $ui = LoginRadius_SocialLogin.lr_login_settings;
        $ui.interfacesize = "";
        $ui.apikey = "f36321df-34bc-4c0a-9a0b-aac96ccfa9ac";
        $ui.callback=""; 
        $ui.lrinterfacecontainer ="interfacecontainerdiv"; 
        LoginRadius_SocialLogin.init(options);  
      }); 
      
      LoginRadiusSDK.onlogin = Successfullylogin;
      
      function Successfullylogin() {
        LoginRadiusSDK.getUserprofile(function (data) {
          console.log(JSON.stringify(data));

          RegisterUser.create({}).$call('loginWithSocialLogin',data).then(
            function(response) {
              console.log('loginCtrl user was registered');
              console.log(response);
              Auth.login({
                username: response.result.password,
                password: response.result.password}).then(
                  function() {
                    if ($scope.$$phase || $scope.$root.$$phase) {
                      $scope.$eval($location.path('/activities'));
                    } else {
                      $scope.$apply($location.path('/activities'));
                    }
                    $location.path('/activities');
                  }, function(response) {
                    $('#error').text(response.data.error);
                  });
            }, function(error) {
              //Use was not registered
              RegisterUser.create({}).$call('registerSocialLogin', data).then(
                function(data) {
                  console.log('SuccessfullyLogin success');
                  console.log(data);
                  //Register and subsequently login
                  Auth.register({
                    username: data.result.password,
                    password: data.result.password,
                    firstName: data.result.firstName,
                    lastName: data.result.lastName,
                    primaryEmail: data.result.primaryEmail,
                    isSocial: true,
                    verifiedEmail: false}).then(
                      function(){
                        if ($scope.$$phase || $scope.$root.$$phase) {
                          $scope.$eval($location.path('/account'));
                        } else {
                          $scope.$apply($location.path('/account'));
                        }
                      }, function(response) {
                        $('#error').text(response.data.error);
                      });
                  
                }, function(response) {
                  console.log('SuccessfullyLogin: error: ');
                  console.log(response);
                  $('#error').text(response.data.error);
                });
             });
        });
      };  
    }
    /**
     * Init loginRadius
     */
    $scope.init = function() {
      LoginRadius_SocialLogin.util.ready(loginRadius);
    }
    /**
     *  Login
     */
    $scope.login = function() {
      if ($scope.signupForm.$valid) {
        Auth.login($scope.loginUser).then(function() {
          $location.path('/activities');
        }, function(response) {
          $scope.error = response.data.error;
        });
      } else {
        $scope.signupForm.submitted = true;
      };
    };
    
    $scope.sendWelcome = function() {
      RegisterUser.create({}).$call('sendConfirmEmail').then(
        function(response) {
          console.log(response);
      }, function(error) {
        console.log(error);
      });
    }
   });
    /* jshint ignore:end */
