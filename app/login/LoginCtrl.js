/* jshint ignore:start */
angular.module('fv')
  .controller('LoginCtrl', function ($scope, $rootScope, $location) {
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

          Parse.Cloud.run('loginWithSocialLogin',data).then(
            function(registeredUser) {
              console.log('loginCtrl user was registered');
              Parse.User.logIn(registeredUser.get('password'),
                               registeredUser.get('password'))
                .then(
                  function() {
                    if ($scope.$$phase || $scope.$root.$$phase) {
                      $scope.$eval($location.path('/activities'));
                    } else {
                      $scope.$apply($location.path('/activities'));
                    }
                  }, function(response) {
                    $('#error').text(response.data.error);
                  });
            }, function(error) {
              //Use was not registered
              Parse.Cloud.run('registerSocialLogin', data).then(
                function(data) {
                  console.log('SuccessfullyLogin success');
                  console.log(data);
                  //Register and subsequently login
                  Parse.User.signUp(
                    data.get('password'),
                    data.get('password'),
                    {
                      firstName: data.get('firstName'),
                      lastName: data.get('lastName'),
                      primaryEmail: data.get('primaryEmail'),
                      isSocial: true,
                      verifiedEmail: false}
                  ).then(
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

    $scope.login = function() {
      if ($scope.signupForm.$valid) {
        Parse.User.logIn($scope.loginUser.username,
                        $scope.loginUser.password)
          .then(
            function() {
              $location.path('/activities');
            }, function(response) {
              $scope.error = response.data.error;
            });
      } else {
        $scope.signupForm.submitted = true;
      };
    };
});
/* jshint ignore:end */
